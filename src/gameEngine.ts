import { USER_ACTIONS } from "./user_input/UserInput";

import { Resolutions } from "./resolutions";
import createVisiblePlayers from "./player/visiblePlayers";
import createVisibleTable from "./table/visibleTable";

import terminal from "./utils";

import HANDS_CONFIG, { HandConfig } from "./hand/config";
import Deck from "./deck/Deck";
import Player from "./player/Player";
import Table from "./table/Table";
import Display from "./display/Display";
import { cardRules, tableRules } from "./game_rules/trix";
import { ILogger } from "./logger/Logger";

type GameEngineParams = {
  players: Player[],
  deck: Deck,
  table: Table,
  display: Display,
  moreThanOneHuman: boolean,
  logger: ILogger,
}

class GameEngine {
  players: Player[];
  turn: number = 0;
  deck: Deck;
  table: Table;
  display: Display;
  message: string[] = [];
  moreThanOneHuman: boolean;
  logger: ILogger;
  round: number = 0;

  constructor({ players, deck, table, display, moreThanOneHuman, logger }: GameEngineParams) {
    this.players = players;
    this.deck = deck;
    this.table = table;
    this.display = display;
    this.moreThanOneHuman = moreThanOneHuman
    this.logger = logger;
  }

  private dealHands(handConfig: HandConfig) {
    for (let i = 0; i < (handConfig.limit || 3); i++) {
      while (this.turn < this.players.length) {
        const card = this.deck.pickCard();
        const player = this.players[this.turn];
        if (!card) {
          throw new Error(`There should be enough cards when dealing ${handConfig.type}, ${player.name}`)
        }
        player.addCard(card, handConfig.priority);
        this.turn++;
      }
      this.turn = 0;
    }
    this.turn = 0;
  }

  async run() {
    // dealing secret
    this.dealHands(HANDS_CONFIG.SECRET);
    this.dealHands(HANDS_CONFIG.DEFENSE);
    this.dealHands(HANDS_CONFIG.PLAYER);

    this.showStatus();

    await this.firstTurnExchange();

    while (true) {
      this.round++;
      this.showStatus();
      const currentPlayer = this.players[this.turn];
      if (!tableRules.canPlaySomething(this.table, currentPlayer)) {
        await this.cannotPlay(currentPlayer);
      } else {
        const resolution = await this.playTurn(currentPlayer);
        this.nextPlayer(resolution);
        this.showStatus({ hidden: true });
        await this.waitForUser();
      }
    }
  }

  private async playTurn(currentPlayer: Player) {
    let resolution;
    const visibleTable = createVisibleTable(this.table);
    const visiblePlayers = createVisiblePlayers(this.players, this.turn)
    while (!resolution) {
      const { action, data } = await currentPlayer.play(this.round, visibleTable, visiblePlayers, cardRules, this.deck.cards.length)
      this.logger.info(`${currentPlayer.name} does ${action}`, data);
      switch (action) {
        case USER_ACTIONS.PLAY_CARDS:
          resolution = await this.play(currentPlayer, data!.cardIndexes!);
          break;
        case USER_ACTIONS.GET_ALL:
          resolution = this.eatAll(currentPlayer);
          break;
        case USER_ACTIONS.WHAT_TO_PLAY:
          await this.whatToPlay();
          resolution = Resolutions.SAME;
          break;
        case USER_ACTIONS.SORT_HAND:
          resolution = Resolutions.SAME;
          currentPlayer.getPlayerHand().sort();
          break;
        case USER_ACTIONS.DISCARD_CARDS:
          this.discardCards(currentPlayer, data!.cardIndexes!);
          break;
        default:
          this.logger.error(`Unkown user action ${action}`);
          this.addMessage(`Unknown user action ${action}`);
      }
    }
    return resolution;
  }

  private async play(player: Player, cardIndexes: number[]): Promise<Resolutions> {
    const cards = player.getCards({ cardIndexes });
    if (!cards) {
      this.logger.error(`Unreachable code, invalid card indexes: ${cardIndexes}`);
      throw new Error(`Unreachable code, invalid card indexes: ${cardIndexes}`);
    }

    const { resolution, additionalData } = tableRules.resolveAction(this.table, cards);
    if (resolution === Resolutions.NOPE) {
      this.logger.warn(`Cannot play that card, ${cards}`);
      this.addMessage("You cannot play that card");

      for (let card of cards) {
        player.returnCard(card);
      }
    } else {
      this.addMessage(`${player.name} played ${cards}`);
    }

    if (additionalData) {
      const { discardPlayed, discardStack, cardsToDiscard, playCards } = additionalData;

      if (discardPlayed) {
        this.table.discardCards(cards);
      }

      if (discardStack) {
        this.table.discardGameCards();
      }

      if (cardsToDiscard && cardsToDiscard > 0) {
        this.table.discardCardsFromStack(cardsToDiscard);
      }

      if (player.hasFinished()) {
        return Resolutions.END;
      }

      if (playCards) {
        this.table.playCards(cards)
      }
    }

    return resolution;
  }

  private eatAll(player: Player): Resolutions {
    this.addMessage(`${player.name} cannot play should take all card.`);
    const stack = this.table.getStack();
    const hand = player.getPlayerHand();
    stack.forEach(c => hand.addCard(c));
    return Resolutions.NEXT;
  }

  private async whatToPlay() {
    const topCard = this.table.topCard();
    if (!topCard) {
      this.addMessage("Anything");
    } else {
      this.addMessage(`${cardRules.getValidCardsAfter(topCard)}`);
    }
  }

  private nextPlayerIndex(howMany: number): number {
    let turn = this.turn + howMany;
    if (turn >= this.players.length) {
      turn = turn % this.players.length;
    }
    return turn;
  }

  private nextPlayer(resolution: Resolutions) {
    const next = (howMany = 1, draw: boolean) => {
      this.addMessage(`Next Player - ${this.players[this.nextPlayerIndex(nextJump)].name}`);
      if (draw) {
        this.drawCardPlayer();
      }
      this.turn = this.nextPlayerIndex(howMany);
    };
    let nextJump = 1;
    let draw = true;
    switch (resolution) {
      case Resolutions.JUMP:
        if (this.players.length > 2) {
          this.addMessage(`${this.players[this.nextPlayerIndex(1)].name} has been skipped`);
          nextJump = 2;
        }
        break;
      case Resolutions.SAME:
        this.addMessage(`${this.players[this.turn].name} plays again`);
        nextJump = 0;
        break;
      case Resolutions.NEXT:
        break;
      case Resolutions.NOPE:
        draw = false;
        this.addMessage("Repeat");
        nextJump = 0;
        break;
      case Resolutions.END:
        this.endGame();
        return process.exit(0);
      default:
        throw new Error(`Unreachable code ${resolution}`);
    }
    next(nextJump, draw);
  }

  private drawCardPlayer() {
    const currentPlayer = this.players[this.turn];
    const hand = currentPlayer.getPlayerHand();
    if (hand.hasEnoughCards() || this.deck.cards.length === 0) {
      return;
    }
    const card = this.deck.pickCard();
    if (card) {
      this.players[this.turn].addCard(card, HANDS_CONFIG.PLAYER.priority);
    }
    this.drawCardPlayer();
  }

  private showStatus({ hidden } = { hidden: false }) {
    this.clear();
    this.display.displayCurrentPlayerStatus({
      turn: this.turn,
      players: this.players,
      table: this.table,
      deck: this.deck,
      hidden,
    });
    this.display.showMessage(this.message);
    this.message = [];
  }

  private clear() {
    this.display.clear();
  }

  private addMessage(msg: string) {
    this.message.push(msg);
  }

  private async waitForUser() {
    if (this.moreThanOneHuman) {
      await terminal.askUser("Press ENTER to continue");
    }
  }

  private async cannotPlay(currentPlayer: Player) {
    this.addMessage(`Player ${currentPlayer.name} cannot play any card`);
    this.showStatus();
    await this.waitForUser();
    this.eatAll(currentPlayer);
    this.nextPlayer(Resolutions.NEXT);
  }

  private discardCards(currentPlayer: Player, cardIndexes: number[]) {
    const cards = currentPlayer.getCards({ cardIndexes });
    this.addMessage(`Player ${currentPlayer.name} discarded ${cards.length} cards with number ${cards[0].number}`);
    this.table.discardCards(cards);
    return Resolutions.SAME;
  }

  private endGame() {
    this.display.endGame(this.players[this.turn]);
  }

  private async firstTurnExchange() {
    for (let [index, player] of this.players.entries()) {
      const { action, data } = await player.play(0, createVisibleTable(this.table), createVisiblePlayers(this.players, index), cardRules, this.deck.cards.length);

      if (action === USER_ACTIONS.EXCHANGE) {
        const [playerHand, defenseHand] = player.getAllHands();
        data!.exchange!.forEach((defenseIndex, playerIndex) => {
          if (defenseIndex) {
            const cardD = defenseHand!.getCard(defenseIndex)!;
            const cardP = playerHand!.getCard(playerIndex)!;
            defenseHand!.replaceCard(cardP, defenseIndex);
            playerHand!.replaceCard(cardD, playerIndex);
          }
        });
      }
    }
  }
}

export default GameEngine;

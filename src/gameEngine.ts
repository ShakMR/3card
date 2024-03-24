import { Resolutions } from "./resolutions";
import createVisibleTable from "./domain/table/visibleTable";
import createVisiblePlayers from "./game/trix/domain/player/visiblePlayers";

import Deck from "./domain/deck/Deck";
import Table from "./domain/table/Table";
import type Display from "./IO/display/Display";
import { createLogger, type ILogger } from "./logger/Logger";
import { USER_ACTIONS } from "./types";
import type { Menu } from "./game/trix/menu/menu";
import type { HandConfig } from "./game/trix/domain/hand/config";
import  Player from "./game/trix/domain/player/Player";
import { cardRules, tableRules } from "./game/trix/rules";
import { DefenseHand, PlayerHand, SecretHand, HandConfigs } from "./game/trix/domain/hand";

export class EndGame extends Error {
  constructor(public turns: number, public winner: string) {
    super(`${winner} wins in ${turns} turns`);
    process.exit(0);
  }
}

type GameEngineParams = {
  players: Player[];
  deck: Deck;
  table: Table;
  display: Display;
  moreThanOneHuman: boolean;
  logger?: ILogger;
  menu: Menu;
};

class GameEngine {
  players: Player[];
  turn = 0;
  deck: Deck;
  table: Table;
  menu: Menu;
  display: Display;
  message: string[] = [];
  moreThanOneHuman: boolean;
  logger: ILogger;
  round = 0;

  constructor({
                players,
                deck,
                table,
                display,
                moreThanOneHuman,
                logger = createLogger("GameEngine"),
                menu
              }: GameEngineParams) {
    this.players = players;
    this.deck = deck;
    this.table = table;
    this.display = display;
    this.moreThanOneHuman = moreThanOneHuman;
    this.logger = logger;
    this.menu = menu;
  }

  init() {
    for (const player of this.players) {
      player.setHand(HandConfigs.PLAYER.priority, new PlayerHand());
      player.setHand(HandConfigs.DEFENSE.priority, new DefenseHand());
      player.setHand(HandConfigs.SECRET.priority, new SecretHand());
    }
  }

  private dealHands(handConfig: HandConfig) {
    for (let i = 0; i < (handConfig.limit || 3); i++) {
      while (this.turn < this.players.length) {
        const card = this.deck.pickCard();
        const player = this.players[this.turn];
        if (!card) {
          throw new Error(
            `There should be enough cards when dealing ${handConfig.type}, ${player.name}`
          );
        }
        player.addCard(card, handConfig.priority);
        this.turn++;
      }
      this.turn = 0;
    }
    this.turn = 0;
  }

  private async setUpTable() {
    this.deck.shuffle();

    // dealing secret
    this.dealHands(HandConfigs.SECRET);
    this.dealHands(HandConfigs.DEFENSE);
    this.dealHands(HandConfigs.PLAYER);

    this.showStatus();

    await this.firstTurnExchange();
  }

  async run() {
    await this.setUpTable();

    // eslint-disable-next-line no-constant-condition
    while (true) {
      this.round++;
      this.showStatus();
      const currentPlayer = this.players[this.turn];
      await this.playerTurn(currentPlayer);
      await this.waitForUser();
    }
  }

  private async playerTurn(currentPlayer: Player) {
    if (!tableRules.canPlaySomething(this.table, currentPlayer)) {
      return this.cannotPlay(currentPlayer);
    }

    const resolution = await this.playTurn(currentPlayer);
    this.nextPlayer(resolution);
    this.showStatus({ hidden: true });
  }

  private async playTurn(currentPlayer: Player) {
    let resolution;
    const visibleTable = createVisibleTable(this.table);
    const visiblePlayers = createVisiblePlayers(this.players, this.turn);

    while (!resolution) {
      const { action, data } = await currentPlayer.play(
        this.round,
        visibleTable,
        visiblePlayers,
        cardRules,
        this.deck.cards.length
      );
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
          this.logger.error(`Unknown user action ${action}`);
          this.addMessage(`Unknown user action ${action}`);
      }
    }
    return resolution;
  }

  private async play(
    player: Player,
    cardIndexes: number[]
  ): Promise<Resolutions> {
    this.logger.info(cardIndexes);
    const cards = player.getCards({ cardIndexes });

    if (!cards) {
      this.logger.error(
        `Unreachable code, invalid card indexes: ${cardIndexes}`
      );
      throw new Error(`Unreachable code, invalid card indexes: ${cardIndexes}`);
    }

    this.logger.info(cards);
    const { resolution, additionalData } = tableRules.resolveAction(
      this.table,
      cards
    );

    if (resolution === Resolutions.NOPE) {
      this.logger.warn(`Cannot play that card, ${cards}`);
      this.addMessage("You cannot play that card");

      for (const card of cards) {
        player.returnCard(card);
      }
    } else {
      this.addMessage(`${player.name} played ${cards}`);
    }

    if (additionalData) {
      const { discardPlayed, discardStack, cardsToDiscard, playCards } =
        additionalData;

      if (discardPlayed) {
        this.table.discardCards(cards);
      }

      if (discardStack) {
        this.table.discardGameCards();
      }

      if (cardsToDiscard && cardsToDiscard > 0) {
        this.table.discardCardsFromStack(cardsToDiscard);
      }

      if (playCards) {
        this.table.playCards(cards);
      }

      if (player.hasFinished()) {
        return Resolutions.END;
      }
    }

    return resolution;
  }

  private eatAll(player: Player): Resolutions {
    this.addMessage(`${player.name} cannot play should take all card.`);
    const stack = this.table.getStack();
    const hand = player.getPlayerHand();
    stack.forEach((c) => hand.addCard(c));
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
      this.addMessage(
        `Next Player - ${this.players[this.nextPlayerIndex(nextJump)].name}`
      );
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
          this.addMessage(
            `${this.players[this.nextPlayerIndex(1)].name} has been skipped`
          );
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
        break;
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
      this.players[this.turn].addCard(card, HandConfigs.PLAYER.priority);
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
      hidden
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
      await this.menu.askUserToContinue();
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
    this.addMessage(
      `Player ${currentPlayer.name} discarded ${cards.length} cards with number ${cards[0].number}`
    );
    this.table.discardCards(cards);
    return Resolutions.SAME;
  }

  private endGame() {
    this.showStatus();
    this.display.endGame(this.players[this.turn]);
    throw new EndGame(this.round, this.players[this.turn].name);
  }

  private async firstTurnExchange() {
    for (const [index, player] of this.players.entries()) {
      // this shouldn't call play but an special function for exchange
      const { action, data } = await player.play(
        0,
        createVisibleTable(this.table),
        createVisiblePlayers(this.players, index),
        cardRules,
        this.deck.cards.length
      );

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

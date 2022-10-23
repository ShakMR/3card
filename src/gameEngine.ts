import UserInput, { USER_ACTIONS } from "./user_input/UserInput";

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

type GameEngineParams = {
  players: Player[],
  deck: Deck,
  table: Table,
  display: Display,
}

class GameEngine {
  players: Player[];
  turn: number = 0;
  deck: Deck;
  table: Table;
  display: Display;
  message: string[] = [];

  constructor({ players, deck, table, display }: GameEngineParams) {
    this.players = players;
    this.deck = deck;
    this.table = table;
    this.display = display;
  }

  _dealHands(handConfig: HandConfig) {
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
    this._dealHands(HANDS_CONFIG.SECRET);
    this._dealHands(HANDS_CONFIG.DEFENSE);
    this._dealHands(HANDS_CONFIG.PLAYER);

    while (true) {
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

  async playTurn(currentPlayer: Player) {
    let resolution;
    const visibleTable = createVisibleTable(this.table);
    const visiblePlayers = createVisiblePlayers(this.players, this.turn)
    while (!resolution) {
      const { action, data } = await currentPlayer.play(visibleTable, visiblePlayers, cardRules, this.deck.cards.length)
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
          this.addMessage(`Unknown user action ${action}`);
      }
    }
    return resolution;
  }

  async play(player: Player, cardIndexes: number[]): Promise<Resolutions> {
    const cards = player.getCards({ cardIndexes });
    if (!cards) {
      throw new Error(`Unreachable code, invalid card indexes: ${cardIndexes}`);
    }

    const { resolution, additionalData } = tableRules.resolveAction(this.table, cards);
    if (resolution === Resolutions.NOPE) {
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

      if (!player.getActiveHand()) {
        return Resolutions.END;
      }

      if (playCards) {
        this.table.playCards(cards)
      }
    }

    return resolution;
  }

  eatAll(player: Player): Resolutions {
    this.addMessage(`${player.name} cannot play should take all card.`);
    const stack = this.table.getStack();
    stack.forEach(c => player.returnCard(c));
    return Resolutions.NEXT;
  }

  async whatToPlay() {
    const topCard = this.table.topCard();
    if (!topCard) {
      this.addMessage("Anything");
    } else {
      this.addMessage(`${cardRules.getValidCardsAfter(topCard)}`);
    }
  }

  nextPlayerIndex(howMany: number): number {
    let turn = this.turn + howMany;
    if (turn >= this.players.length) {
      turn = turn % this.players.length;
    }
    return turn;
  }

  nextPlayer(resolution: Resolutions) {
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

  drawCardPlayer() {
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

  showStatus({ hidden } = { hidden: false }) {
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

  clear() {
    this.display.clear();
  }

  addMessage(msg: string) {
    this.message.push(msg);
  }

  async waitForUser() {
    await terminal.askUser("Press ENTER to continue");
  }

  async cannotPlay(currentPlayer: Player) {
    this.addMessage(`Player ${currentPlayer.name} cannot play any card`);
    this.showStatus();
    await this.waitForUser();
    this.eatAll(currentPlayer);
    this.nextPlayer(Resolutions.NEXT);
  }

  discardCards(currentPlayer: Player, cardIndexes: number[]) {
    const cards = currentPlayer.getCards({ cardIndexes });
    this.addMessage(`Player ${currentPlayer.name} discarded ${cards.length} cards with number ${cards[0].number}`);
    this.table.discardCards(cards);
    return Resolutions.SAME;
  }

  endGame() {
    this.display.endGame(this.players[this.turn]);
  }
}

export default GameEngine;

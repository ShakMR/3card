const terminal = require("./utils");
const RESOLUTIONS = require("./resolutions");
const HANDS_CONFIG = require("./hand/config.json");
const { USER_ACTIONS } = require("./user_input/UserInput");

/**
 * @typedef GameEngine
 * @property {Player[]} players
 * @property {Deck[]} deck
 * @property {Table[]} table
 * @property {Display[]} display
 * @property {UserInput} userInput
 */
class GameEngine {
  constructor({players, deck, table, display, userInput}) {
    this.players = players;
    this.turn = 0;
    this.deck = deck;
    this.table = table;
    this.display = display;
    this.message = [];
    this.userInput = userInput;
  }

  _dealHands(handConfig) {
    for (let i = 0; i < (handConfig.limit || 3); i++) {
      while (this.turn < this.players.length) {
        const card = this.deck.pickCard();
        this.players[this.turn].addCard(card, handConfig.priority);
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
      const currentTopCard = this.table.topCard();
      if (currentTopCard && !currentPlayer.canPlaySomething(currentTopCard.number)) {
        await this.cannotPlay(currentPlayer);
      } else {
        let resolution;
        while (!resolution) {
          const action = await this.userInput.whatToDoInTurn(currentPlayer);
          switch (action.type) {
            case USER_ACTIONS.PLAY_CARDS:
              resolution = await this.play(currentPlayer, action.data.cardIndexes);
              break;
            case USER_ACTIONS.GET_ALL:
              resolution = this.eatAll(currentPlayer);
              break;
            case USER_ACTIONS.WHAT_TO_PLAY:
              await this.whatToPlay();
              break;
            case USER_ACTIONS.SORT_HAND:
              resolution = RESOLUTIONS.SAME;
              currentPlayer.getPlayerHand().sort();
              break;
            case USER_ACTIONS.DISCARD_CARDS:
              this.discardCards(currentPlayer, action.data.cardIndexes);
              break;
            default:
              this.message(`Unknown user action ${action}`);
          }
        }
        this.nextPlayer(resolution);
        this.showStatus({ hidden: true });
        await this.waitForUser();
      }
    }
  }

  /**
   *
   * @param {Player} player
   * @param {number[]} cardIndexes
   * @returns {Promise<string|*>}
   */
  async play(player, cardIndexes) {
    const cards = player.playCard({ cardIndexes });
    if (!cards) {
      throw new Error(`Unreachable code, invalid card indexes: ${cardIndexes}`);
    }

    const resolution = this.table.playCard(cards);
    if (resolution === RESOLUTIONS.NOPE) {
      this.addMessage("You cannot play that card");

      for (let card of cards) {
        player.returnCard(card);
      }
    } else {
      this.addMessage(`${player.name} played ${cards}`);
    }

    if (!player.getActiveHand()) {
      return RESOLUTIONS.END;
    }
    return resolution;
  }

  eatAll(player) {
    this.addMessage(`${player.name} cannot play should take all card.`);
    const stack = this.table.eatStack();
    stack.forEach(c => player.returnCard(c));
    return RESOLUTIONS.NEXT;
  }

  async whatToPlay() {
    const topCard = this.table.topCard();
    if (!topCard) {
      this.addMessage("Anything");
    } else {
      this.addMessage(topCard.getValidNext());
    }
  }

  nextPlayerIndex(howMany) {
    let turn = this.turn + howMany;
    if (turn >= this.players.length) {
      turn = turn % this.players.length;
    }
    return turn;
  }

  nextPlayer(resolution, card) {
    const next = (howMany = 1, draw) => {
      this.addMessage(`Next Player - ${this.players[this.nextPlayerIndex(nextJump)].name}`);
      if (draw) {
        this.drawCardPlayer();
      }
      this.turn = this.nextPlayerIndex(howMany);
    };
    let nextJump = 1;
    let draw = true;
    switch (resolution) {
      case RESOLUTIONS.JUMP:
        if (this.players.length > 2) {
          this.addMessage(`${this.players[this.nextPlayerIndex(1)].name} has been skipped`);
          nextJump = 2;
        }
        break;
      case RESOLUTIONS.SAME:
        this.addMessage(`${this.players[this.turn].name} plays again`);
        nextJump = 0;
        break;
      case RESOLUTIONS.NEXT:
        break;
      case RESOLUTIONS.NOPE:
        draw = false;
        this.addMessage("Repeat");
        nextJump = 0;
        break;
      case RESOLUTIONS.END:
        this.endGame();
        return process.exit(0);
      default:
        throw new Error("Unreachable code", resolution);
    }
    next(nextJump, draw);
  }

  drawCardPlayer() {
    /** @type Player */
    const currentPlayer = this.players[this.turn];
    /** @type PlayerHand */
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

  addMessage(msg) {
    this.message.push(msg);
  }

  async waitForUser() {
    await terminal.askUser("Press ENTER to continue");
  }

  async cannotPlay(currentPlayer) {
    this.addMessage(`Player ${currentPlayer.name} cannot play any card`);
    this.showStatus();
    await this.waitForUser();
    this.eatAll(currentPlayer);
    this.nextPlayer(RESOLUTIONS.NEXT);
  }

  discardCards(currentPlayer, cardIndexes) {
    const cards = currentPlayer.playCard({ cardIndexes });
    this.addMessage(`Player ${currentPlayer.name} discarded ${cards.length} cards with number ${cards[0].number}`);
    this.table.discardCards(cards);
    return RESOLUTIONS.SAME;
  }

  endGame() {
    while(1) {
      this.display.endGame(this.players[this.turn]);
    }
  }
}

module.exports = GameEngine;

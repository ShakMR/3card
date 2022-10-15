const terminal = require("../utils");
const UserInput = require('./UserInput');

const ACTION_KEYS = {
  GET: 'G',
  WHAT_TO_PLAY: 'W',
  SORT: 'S',
}

/**
 * @typedef TurnDecision
 * @property {string}         type
 * @property {Object}         [data]
 * @property {number[]}       data.cardIndexes
 */

class CommandLineInput extends UserInput {

  /**
   * @param {Player} currentPlayer
   * @returns {Promise<TurnDecision>}
   */
  async whatToDoInTurn(currentPlayer) {
    const shouldSelectByIndex = !currentPlayer.getActiveHand().visible;
    const answer = await terminal.askUser(
      `
  What next, ${currentPlayer.name}?
  ${
        shouldSelectByIndex
          ? "[0-2] Play facing down"
          : "[A-10-K] play cards"
      }
  [${ACTION_KEYS.GET}] get stack of cards
  [${ACTION_KEYS.SORT}] sort hand
  [${ACTION_KEYS.WHAT_TO_PLAY}] what can I play?

  Answer: `
    );

    const upperAnswer = answer.toUpperCase();

    if (![ACTION_KEYS.GET, ACTION_KEYS.WHAT_TO_PLAY].includes(upperAnswer)) {
      const res = await this.selectCards(upperAnswer, currentPlayer);
      if (res.type !== "Error") {
        return res;
      }
    }

    switch (upperAnswer) {
      case ACTION_KEYS.GET:
        return {
          type: UserInput.USER_ACTIONS.GET_ALL,
        };
      case ACTION_KEYS.WHAT_TO_PLAY:
        return {
          type: UserInput.USER_ACTIONS.WHAT_TO_PLAY,
        }
      case ACTION_KEYS.SORT:
        return {
          type: UserInput.USER_ACTIONS.SORT_HAND,
        }
      default:
        return this.whatToDoInTurn(currentPlayer);
    }
  }

  async selectCards(cardNumber, currentPlayer) {
    const playerCurrentHand = currentPlayer.getActiveHand();
    let cards = playerCurrentHand.cards
      .map((c, index) => [c, index])
      .filter(([c]) => `${c.symbol}` === cardNumber);

    if (cards.length === 0) {
      return {
        type: "Error"
      }
    }


    if (cards.length > 1) {
      const answer = await terminal.askUserForNumber(`There are ${cards.length} card with number ${cardNumber}, how many do you want to play?`);
      cards = cards.slice(0, answer);
    }

    if (cards.length === 4) {
      return {
        type: UserInput.USER_ACTIONS.DISCARD_CARDS,
        data: {
          cardIndexes: cards.map(([_,index]) => index),
        }
      };
    }

    return {
      type: UserInput.USER_ACTIONS.PLAY_CARDS,
      data: {
        cardIndexes: cards.map(([_,index]) => index),
      }
    };
  }
}

module.exports = CommandLineInput;

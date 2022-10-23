import terminal from "../utils"
import UserInput, { ActionData, USER_ACTIONS } from "./UserInput";
import Player from "../player/Player";

const ACTION_KEYS = {
  GET: 'G',
  WHAT_TO_PLAY: 'W',
  SORT: 'S',
}

class CommandLineInput extends UserInput {
  async getOrder(name: string, shouldSelectByIndex: boolean): Promise<USER_ACTIONS | string> {
    const answer = await terminal.askUser(
        `
  What next, ${name}?
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

    switch (upperAnswer) {
      case ACTION_KEYS.GET:
        return USER_ACTIONS.GET_ALL;
      case ACTION_KEYS.WHAT_TO_PLAY:
        return USER_ACTIONS.WHAT_TO_PLAY;
      case ACTION_KEYS.SORT:
        return USER_ACTIONS.SORT_HAND;
      default:
        return upperAnswer;
    }
  }

  async whatToDoInTurn(currentPlayer: Player): Promise<ActionData> {
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
          type: USER_ACTIONS.GET_ALL,
        };
      case ACTION_KEYS.WHAT_TO_PLAY:
        return {
          type: USER_ACTIONS.WHAT_TO_PLAY,
        }
      case ACTION_KEYS.SORT:
        return {
          type: USER_ACTIONS.SORT_HAND,
        }
      default:
        return this.whatToDoInTurn(currentPlayer);
    }
  }

  async selectCards(cardNumberStr: string, currentPlayer: Player): Promise<ActionData> {
    const playerCurrentHand = currentPlayer.getActiveHand();
    let cards = playerCurrentHand.cards
      .map((c, index) => ({ card: c, index }))
      .filter(({ card, index }) => `${card.symbol}` === cardNumberStr);

    if (cards.length === 0) {
      return {
        type: "Error"
      }
    }


    if (cards.length > 1) {
      const answer = await terminal.askUserForNumber(`There are ${cards.length} card with number ${cardNumberStr}, how many do you want to play?`);
      cards = cards.slice(0, answer);
    }

    if (cards.length === 4) {
      return {
        type: USER_ACTIONS.DISCARD_CARDS,
        data: {
          cardIndexes: cards.map(({index}) => index),
        }
      };
    }

    return {
      type: USER_ACTIONS.PLAY_CARDS,
      data: {
        cardIndexes: cards.map(({index}) => index),
      }
    };
  }
}

export default CommandLineInput;

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

  async getExchangeForPosition(name: string, position: number): Promise<number> {
    return terminal.askUserForNumber(`Do you want to exchange card in position ${position} for any in defense?`, 0, 2, true);
  }
}

export default CommandLineInput;

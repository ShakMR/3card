import Player from "../player/Player";

export enum USER_ACTIONS {
  PLAY_CARDS = 'play',
  DISCARD_CARDS = 'discard',
  GET_ALL = 'getall',
  WHAT_TO_PLAY = 'whatToPlay',
  SORT_HAND = 'sortHand',
}

export type ActionData = { type: USER_ACTIONS, data?: any } | { type: 'Error' };

abstract class UserInput {
  abstract whatToDoInTurn(currentPlayer: Player): Promise<ActionData>;
}


export default UserInput
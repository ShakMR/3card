import Player from "../player/Player";

export enum USER_ACTIONS {
  PLAY_CARDS = 'play',
  DISCARD_CARDS = 'discard',
  GET_ALL = 'getall',
  WHAT_TO_PLAY = 'whatToPlay',
  SORT_HAND = 'sortHand',
  EXCHANGE = 'exchange',
  NP = 'np',
}

export type ActionData = { type: USER_ACTIONS, data?: any } | { type: 'Error' };

abstract class UserInput {
  abstract getOrder(...args: any): Promise<USER_ACTIONS | string>;

  abstract getExchangeForPosition(name: string, position: number): Promise<number>;
}


export default UserInput

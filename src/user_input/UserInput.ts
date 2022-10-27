export enum USER_ACTIONS {
  PLAY_CARDS = "play",
  DISCARD_CARDS = "discard",
  GET_ALL = "getall",
  WHAT_TO_PLAY = "whatToPlay",
  SORT_HAND = "sortHand",
  EXCHANGE = "exchange",
  NP = "np",
}

abstract class UserInput {
  abstract getOrder(
    name: string,
    shouldSelectByIndex: boolean
  ): Promise<USER_ACTIONS | string>;

  abstract getExchangeForPosition(position: number): Promise<number>;
}

export default UserInput;

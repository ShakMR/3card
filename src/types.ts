import type Player from "./game/trix/domain/player/Player";

export enum GameType {
  local,
  online
}

export type LocalGame = {
  type: GameType.local;
  players: Player[];
  numberOfHumans: number;
};

type HostedGame = {
  type: GameType.online;
  id: null;
};

type JoinedGame = {
  type: GameType.online;
  id: number;
};

type OnlineGame = HostedGame | JoinedGame;

export type GameConfig = LocalGame | OnlineGame;

export class Pair<T, K = T> {
  constructor(public first: T, public second: K) {
  }
}

export enum USER_ACTIONS {
  PLAY_CARDS = "play",
  DISCARD_CARDS = "discard",
  GET_ALL = "getall",
  WHAT_TO_PLAY = "whatToPlay",
  SORT_HAND = "sortHand",
  EXCHANGE = "exchange",
  NP = "np",
}

export type TurnAction = USER_ACTIONS | string;
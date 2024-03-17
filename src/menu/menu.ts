import { type GameType, type LocalGame, Pair, type TurnAction } from "../types";
import type Player from "../player/Player";

export interface Menu {
  showWelcomeTitle(): void;

  askForGameType(): Promise<GameType>;

  askForLocalGameConfig(): Promise<LocalGame>;

  askForTurnAction(player: Player, shouldSelectByIndex?: boolean): Promise<TurnAction>;

  askForInitialCardExchange(position: number): Promise<Pair<number, number>>;

  askUserToContinue(): Promise<void>;
}

import Player from "../player/Player";
import Table from "../table/Table";
import Deck from "../deck/Deck";

export type Status = {
  turn: number,
  players: Player[];
  table: Table,
  deck: Deck,
  hidden: boolean,
}

abstract class Display {
  abstract displayCurrentPlayerStatus({ turn, players, table, deck, hidden }: Status): void;

  abstract showMessage(messages: string[]): void;

  abstract clear(): void;

  abstract endGame(winner: Player): void;
}

export default Display;

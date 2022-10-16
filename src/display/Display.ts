import Player from "../player/Player";
import Table from "../table/Table";
import Deck from "../deck/Deck";
import Card from "../card/Card";

export type Status<C extends Card> = {
  turn: number,
  players: Player[];
  table: Table,
  deck: Deck<C>,
  hidden: boolean,
}

abstract class Display {
  abstract displayCurrentPlayerStatus<C extends Card>({ turn, players, table, deck, hidden }: Status<C>): void;

  abstract endGame(winner: Player): void;
}

export default Display;

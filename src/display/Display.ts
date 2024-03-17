import Player from "../player/Player";
import Table from "../table/Table";
import Deck from "../deck/Deck";

export type Status = {
  turn: number;
  players: Player[];
  table: Table;
  deck: Deck;
  hidden: boolean;
};

interface Display {
  displayCurrentPlayerStatus({
    turn,
    players,
    table,
    deck,
    hidden,
  }: Status): void;

  showMessage(messages: string[]): void;

  show(plainText: string): void;

  clear(): void;

  endGame(winner: Player): void;
}

export default Display;

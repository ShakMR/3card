import Table from "../../domain/table/Table";
import Deck from "../../domain/deck/Deck";
import type Player from "../../game/trix/domain/player/Player";

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

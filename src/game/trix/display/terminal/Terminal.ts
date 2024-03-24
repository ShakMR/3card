import Display, { Status } from "../../../../IO/display/Display";
import { FontColor } from "./colors";
import { Styles } from "./styles";
import { onePlayerTable } from "./onePlayerTable";
import { twoPlayerTable } from "./twoPlayerTable";
import type { TableDisplayFunc } from "./TableDisplayFunc";
import Player, { TypeOfPlayer } from "../../domain/player/Player";

const tableDisplayFuncs: Array<TableDisplayFunc | null> = [null, onePlayerTable, twoPlayerTable];

class Terminal implements Display {
  constructor(private enabled: boolean = true) {
  }

  displayCurrentPlayerStatus(status: Status) {
    if (!this.enabled) {
      return
    }
    const nPlayers = status.players.length;

    const nHumanPlayers = status.players.reduce(
      (acc, player) =>
        acc + (player.typeOfPlayer === TypeOfPlayer.Human ? 1 : 0),
      0
    );

    const funct = tableDisplayFuncs[nPlayers];

    if (funct) {
      funct(status, nHumanPlayers === 0);
    }
  }

  endGame(winner: Player) {
    if (!this.enabled) {
      return
    }
    console.log(
      Styles.blink,
      `WINNER ${winner.name.toUpperCase()}`,
      Styles.reset
    );
  }

  showMessage(messages: string[]) {
    if (!this.enabled) {
      return
    }
    if (messages.length > 0) {
      messages.forEach((message) => {
        console.log(
          `${FontColor.red} ${Styles.underscore}${message}${Styles.reset}`
        );
      });
    }
  }

  show(plainText: string) {
    console.log(plainText);
  }

  clear() {
    if (!this.enabled) {
      return
    }
    console.clear();
  }
}

export default Terminal;

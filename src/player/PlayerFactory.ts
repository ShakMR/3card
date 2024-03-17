import type UserInput from "../user_input/UserInput";
import HumanPlayer from "./HumanPlayer";
import type Bot from "./Bot";
import RandomComputerPlayer from "./RandomComputerPlayer";
import LinearComputerPlayer from "./LinearComputerPlayer";
import type { Menu } from "../menu/menu";

const BOT_WAITTIME = 500;

export class PlayerFactory {
  static createHumanPlayer(name: string, menu: Menu, userInput: UserInput): HumanPlayer {
      return new HumanPlayer({ name, menu, input: userInput });
  }

  static createRandomComputerPlayer(): Bot {
    const whichBot = Math.floor(Math.random() * 2);
    if (whichBot === 0) {
      return new RandomComputerPlayer(BOT_WAITTIME);
    } else {
      return new LinearComputerPlayer(BOT_WAITTIME);
    }
  }
}
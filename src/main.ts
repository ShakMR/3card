import sourceMapSupport from "source-map-support";
import GameEngine from "./gameEngine";
import PlayerHand from "./hand/PlayerHand";
import SecretHand from "./hand/SecretHand";
import DefenseHand from "./hand/DefenseHand";
import Table from "./table/Table";
import utils from "./utils";
import HANDS_CONFIG from "./hand/config";
import Terminal from "./display/Terminal";
import CommandLineInput from "./user_input/CommandLineInput";
import PokerDeck from "./deck/PokerDeck";
import HumanPlayer from "./player/HumanPlayer";
import UserInput from "./user_input/UserInput";
import RandomComputerPlayer from "./player/RandomComputerPlayer";
import { createLogger } from "./logger/Logger";
import LinearComputerPlayer from "./player/LinearComputerPlayer";
import Bot from "./player/Bot";

sourceMapSupport.install();

const logger = createLogger("general");

const createHumanPlayer = async (
  i: number,
  userInput: UserInput
): Promise<HumanPlayer> => {
  const name = await utils.askUser(`Player ${i + 1} name?`);
  return new HumanPlayer({ name, input: userInput });
};

const createRandomComputerPlayer = async (): Promise<Bot> => {
  const whichBot = Math.floor(Math.random() * 2);
  if (whichBot === 0) {
    return new RandomComputerPlayer(logger, 500);
  } else {
    return new LinearComputerPlayer(logger, 500);
  }
};

const main = async () => {
  const display = new Terminal();
  display.clear();
  const nPlayers = await utils.askUserForNumber("N Players?", 1, 2);
  const players = [];
  const userInput = new CommandLineInput();
  let numberOfHumans = 0;
  for (let i = 0; i < nPlayers; i++) {
    const typeOfPlayer = await utils.askUser(`Player ${i}, Human or Bot?[H/b]`);
    let p;
    if (typeOfPlayer === "b") {
      p = await createRandomComputerPlayer();
    } else {
      numberOfHumans++;
      p = await createHumanPlayer(i, userInput);
    }
    p.setHand(HANDS_CONFIG.PLAYER.priority, new PlayerHand());
    p.setHand(HANDS_CONFIG.DEFENSE.priority, new DefenseHand());
    p.setHand(HANDS_CONFIG.SECRET.priority, new SecretHand());
    players.push(p);
  }
  const deck = new PokerDeck();
  deck.init();
  const table = new Table();
  const engine = new GameEngine({
    players,
    deck,
    table,
    display,
    moreThanOneHuman: numberOfHumans > 1,
    logger,
  });
  await engine.run();
};

main().catch((error) => console.error(error));

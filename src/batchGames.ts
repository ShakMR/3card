import { hideBin } from "yargs/helpers";
import yargs, { Argv, Options } from "yargs";
import { createLogger } from "./logger/Logger";
import Terminal from "./display/Terminal";
import PokerDeck from "./deck/PokerDeck";
import GameEngine, { EndGame } from "./gameEngine";
import RandomComputerPlayer from "./player/RandomComputerPlayer";
import LinearComputerPlayer from "./player/LinearComputerPlayer";
import Table from "./table/Table";
import HANDS_CONFIG from "./hand/config";
import PlayerHand from "./hand/PlayerHand";
import DefenseHand from "./hand/DefenseHand";
import SecretHand from "./hand/SecretHand";
import Bot from "./player/Bot";
import { ConsoleMenu } from "./menu/ConsoleMenu";
import CommandLineInput from "./user_input/CommandLineInput";

const options: Record<string, Options> = {
  games: {
    alias: "n",
    description: "Number of games to play in a row",
    type: "number",
    default: 1,
  },
  display: {
    alias: "d",
    description: "Make game visible",
    type: "boolean",
    default: false,
  },
  waitingTime: {
    alias: "w",
    description: 'Seconds of "thinking" for each round for each bot',
    type: "number",
    default: 0,
  },
  concurrent: {
    alias: "c",
    description: "Run all games concurrently",
    type: "boolean",
    default: false,
  },
};

interface Arguments{
  [x: string]: unknown;
  _: string[];
  games: number;
  n: number;
  display: boolean;
  d: boolean;
  waitingTime: number;
  w: number;
  concurrent: boolean;
  c: boolean;
}

const args = yargs(hideBin(process.argv))
  .command("rVl", "random against linear")
  .command("lVl", "linear against linear")
  .command("rVr", "random against random")
  .options(options)
  .help()
  .alias("help", "h")
  .parseSync() as unknown as Arguments;

const addHands = (p: Bot) => {
    p.setHand(HANDS_CONFIG.PLAYER.priority, new PlayerHand());
    p.setHand(HANDS_CONFIG.DEFENSE.priority, new DefenseHand());
    p.setHand(HANDS_CONFIG.SECRET.priority, new SecretHand());
    return p;
}

const logger = createLogger("Games", "trackGames");
const botsLoggers = createLogger("Bots", "logs");
const runGame = async (shoulDisplay: boolean, waitingTime: number) => {
    const display = new Terminal(shoulDisplay);
    display.clear();

    const players = [];
    if (args._[0] === "rvl") {
      players.push(addHands(new RandomComputerPlayer(waitingTime)));
      players.push(addHands(new LinearComputerPlayer(waitingTime)));
    }

    const deck = new PokerDeck();
    deck.init();
    const table = new Table();
    const engine = new GameEngine({
        players,
        deck,
        table,
        display,
        moreThanOneHuman: false,
        logger: botsLoggers,
        menu: new ConsoleMenu(display, new CommandLineInput()),
    });
    try {
      await engine.run();
    } catch (e) {
      if (e instanceof EndGame) {
        logger.info(`We have a winner`, { winner: e.winner, turns: e.turns });
      } else {
        console.error(e);
      }
    }
};

const main = async () => {
    let finished = 0;
  for (let i = 0; i < args.n; i++) {
    if (args.concurrent) {
      console.log("Runnning game", i, "concurrently");
      runGame(args.display, args.waitingTime * 1000)
          .then(() => {
              finished++;
              console.log("finished game", i);
              if (finished === args.n) {
                  console.log("All done");
              }
          });
    } else {
      console.log("Awaiting for game", i);
      await runGame(args.display, args.waitingTime * 1000);
      console.log("finished game", i);
    }
  }
}

main()

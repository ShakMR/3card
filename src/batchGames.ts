import { hideBin } from "yargs/helpers";
import yargs, { Options } from "yargs";
import { createLogger } from "./logger/Logger";
import Terminal from "./game/trix/display/terminal/Terminal";
import PokerDeck from "./domain/deck/PokerDeck";
import GameEngine, { EndGame } from "./gameEngine";
import Table from "./domain/table/Table";
import { ConsoleMenu } from "./game/trix/menu/ConsoleMenu";
import CommandLineInput from "./IO/user_input/CommandLineInput";
import RandomComputerPlayer from "./game/trix/domain/player/RandomComputerPlayer";
import LinearComputerPlayer from "./game/trix/domain/player/LinearComputerPlayer";
import type Bot from "./game/trix/domain/player/Bot";
import { DefenseHand, HandConfigs, PlayerHand, SecretHand } from "./game/trix/domain/hand";

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
    p.setHand(HandConfigs.PLAYER.priority, new PlayerHand());
    p.setHand(HandConfigs.DEFENSE.priority, new DefenseHand());
    p.setHand(HandConfigs.SECRET.priority, new SecretHand());
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

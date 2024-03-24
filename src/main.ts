import sourceMapSupport from "source-map-support";
import GameEngine from "./gameEngine";
import Table from "./domain/table/Table";
import Terminal from "./game/trix/display/terminal/Terminal";
import CommandLineInput from "./IO/user_input/CommandLineInput";
import PokerDeck from "./domain/deck/PokerDeck";
import { ConsoleMenu } from "./game/trix/menu/ConsoleMenu";
import { GameType } from "./types";

sourceMapSupport.install();

const main = async () => {
  const display = new Terminal();
  const userInput = new CommandLineInput();
  const menu = new ConsoleMenu(display, userInput);
  menu.showWelcomeTitle();
  const gameType = await menu.askForGameType();

  let engine: GameEngine;

  if (gameType === GameType.local) {
    const { players, numberOfHumans } = await  menu.askForLocalGameConfig();

    const deck = new PokerDeck();
    deck.init();
    const table = new Table();
    engine = new GameEngine({
      players,
      deck,
      table,
      display,
      moreThanOneHuman: numberOfHumans > 1,
      menu,
    });

    engine.init();
  } else {
    throw new Error("Not implemented yet");
  }

  await engine.run();
};

main().catch((error) => console.error(error));

import sourceMapSupport from 'source-map-support';
sourceMapSupport.install();

import GameEngine from "./gameEngine"
import Player from "./player/Player"
import Deck from "./deck/Deck"
import PlayerHand from "./hand/PlayerHand"
import SecretHand from "./hand/SecretHand"
import DefenseHand from "./hand/DefenseHand"
import Table from "./table/Table"
import utils from "./utils"
import HANDS_CONFIG from "./hand/config.json"
import Terminal from "./display/terminal"
import CommandLineInput from "./user_input/CommandLineInput"

const main = async () => {
  const display = new Terminal();
  display.clear();
  const nPlayers = await utils.askUserForNumber("N Players?", 1, 2);
  const players = [];
  for (let i = 0; i < nPlayers; i++) {
    const name = await utils.askUser(`Player ${i + 1} name?`);
    const p = new Player({ name });
    p.setHand(HANDS_CONFIG.PLAYER.priority, new PlayerHand());
    p.setHand(HANDS_CONFIG.DEFENSE.priority, new DefenseHand());
    p.setHand(HANDS_CONFIG.SECRET.priority, new SecretHand());
    players.push(p);
  }
  const deck = new Deck();
  deck.init();
  const table = new Table();
  const userInput = new CommandLineInput();
  const engine = new GameEngine({ players, deck, table, display, userInput });
  await engine.run();
};

main().catch(error => console.error(error));

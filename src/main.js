const GameEngine = require("./gameEngine");
const Player = require("./player/Player");
const Deck = require("./deck/Deck");
const PlayerHand = require("./hand/PlayerHand");
const SecretHand = require("./hand/SecretHand");
const DefenseHand = require("./hand/DefenseHand");
const Table = require("./table/Table");
const utils = require("./utils");
const HANDS_CONFIG = require("./hand/config.json");
const Terminal = require("./display/terminal");
const CommandLineInput = require("./user_input/CommandLineInput");

main = async () => {
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

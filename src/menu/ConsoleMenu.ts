import type Display from "../display/Display";
import UserInput from "../user_input/UserInput";
import type { Menu } from "./menu";
import AsciiWelcomeMessage from "./asciiWelcomeMessage";
import { GameType, type LocalGame, Pair, type TurnAction, USER_ACTIONS } from "../types";
import type Player from "../player/Player";
import CommandLineInput from "../user_input/CommandLineInput";
import { PlayerFactory } from "../player/PlayerFactory";

export class ConsoleMenu implements Menu {
  constructor(private display: Display,
              private userInput: UserInput,
  ) {
  }

  async askForGameType(): Promise<GameType> {
    const gameTypeName = await this.userInput.askForOptions(["Local", "Online"], "What kind of game do you want to play?");
    if (gameTypeName === "Local") {
      return GameType.local;
    }
    return GameType.online;
  }

  async askForLocalGameConfig(): Promise<LocalGame> {
    const nPlayers = await this.userInput.askUserForNumber("How many players in total?", { rangeStart: 1, rangeEnd: 2, showRange: true});
    const players = [];
    const userInput = new CommandLineInput();
    let numberOfHumans = 0;

    for (let i = 0; i < nPlayers; i++) {
      const typeOfPlayer = await this.userInput.askForOptions(['H', 'b'], `Player ${i}, Human or Bot?`);
      let p;

      if (typeOfPlayer === "b") {
        p = PlayerFactory.createRandomComputerPlayer();
      } else {
        numberOfHumans++;
        const name = await this.userInput.askUser(`Player ${i} name?`);
        p = PlayerFactory.createHumanPlayer(name, this, userInput);
      }

      players.push(p);
    }

    return {
      type: GameType.local,
      players,
      numberOfHumans
    };
  }

  async askForTurnAction(player: Player, shouldSelectByIndex?: boolean): Promise<TurnAction> {
    const ACTION_KEYS = {
      GET: "G",
      WHAT_TO_PLAY: "W",
      SORT: "S"
    };
    const answer = await this.userInput.askUser(
      `
  What next, ${player.name}?
  ${shouldSelectByIndex ? "[0-2] Play facing down" : "[A-10-K] play cards"}
  [${ACTION_KEYS.GET}] get stack of cards
  [${ACTION_KEYS.SORT}] sort hand
  [${ACTION_KEYS.WHAT_TO_PLAY}] what can I play?

  Answer: `
    );

    const upperCaseAnswer = answer.toUpperCase();

    switch (upperCaseAnswer) {
      case ACTION_KEYS.GET:
        return USER_ACTIONS.GET_ALL;
      case ACTION_KEYS.WHAT_TO_PLAY:
        return USER_ACTIONS.WHAT_TO_PLAY;
      case ACTION_KEYS.SORT:
        return USER_ACTIONS.SORT_HAND;
      default:
        return upperCaseAnswer;
    }
  }

  async askForInitialCardExchange(position: number): Promise<Pair<number, number>> {
    const endPosition = await this.userInput.askUserForNumber(
      `Do you want to exchange card in position ${position} for any in defense?`,
      { rangeStart: 0, rangeEnd: 2, optional: true, showRange: true }
    );
    return new Pair(position, endPosition);
  }


  showWelcomeTitle(): void {
    this.display.clear();
    this.display.show(AsciiWelcomeMessage);
  }

  async askUserToContinue(): Promise<void> {
    await this.userInput.askUser("Waiting for you to press enter to continue");
  }
}
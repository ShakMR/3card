import Player, { TypeOfPlayer } from "./Player";
import { ILogger } from "../logger/Logger";
import {
  adjectives,
  starWars,
  uniqueNamesGenerator,
} from "unique-names-generator";

abstract class Bot extends Player {
  // it's just the numbers we can play, so we can select randomly
  public typeOfPlayer: TypeOfPlayer = TypeOfPlayer.Bot;

  protected think = (ms: number) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  };

  protected constructor(protected logger: ILogger, namePrefix: string) {
    const name = uniqueNamesGenerator({
      dictionaries: [adjectives, starWars],
      style: "capital",
      separator: " ",
    });
    super({ name: `${namePrefix} ${name}` });
  }
}

export default Bot;

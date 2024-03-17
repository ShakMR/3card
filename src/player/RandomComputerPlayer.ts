import { PlayerAction } from "./Player";
import { VisibleTable } from "../table/visibleTable";
import { VisiblePlayers } from "./visiblePlayers";
import { CardRules } from "../game_rules/trix";
import { createLogger, ILogger } from "../logger/Logger";
import Bot from "./Bot";
import { USER_ACTIONS } from "../types";

const getRandomPick = (array: number[]): number => {
  const pick = Math.floor(Math.random() * array.length);
  return array[pick];
};

class RandomComputerPlayer extends Bot {
  constructor(private waitingTime: number, logger: ILogger = createLogger("Random Bot")) {
    super("Random", logger);
  }

  async play(
    round: number,
    table: VisibleTable,
    otherPlayers: VisiblePlayers,
    cardRules: CardRules
  ): Promise<PlayerAction> {
    if (round === 0) {
      return {
        action: USER_ACTIONS.NP,
      };
    }

    await this.think(this.waitingTime);
    const indexesToPlay = new Array<number>();
    const topCard = table.topCard();
    const activeHand = this.getActiveHand();
    if (activeHand.cards && activeHand.cards[0] !== null) {
      for (const [index, card] of activeHand.cards.entries()) {
        const canBePlayer =
          !topCard || cardRules.xCanBePlayedAfterY({ x: card!, y: topCard });
        this.logger.info(
          `${this.name} tested if ${card} can be played on top of ${topCard} -> ${canBePlayer}`
        );
        if (canBePlayer) {
          indexesToPlay.push(index);
        }
      }
    } else {
      activeHand.cards.forEach((c, i) => indexesToPlay.push(i));
    }

    const indexToPlay = getRandomPick(indexesToPlay);
    this.logger.info(
      `${this.name} plays ${activeHand.cards} ${indexToPlay} -> ${
        activeHand.cards?.[indexToPlay] || "SECRET"
      } on top of ${topCard}`
    );

    return {
      action: USER_ACTIONS.PLAY_CARDS,
      data: {
        cardIndexes: [indexToPlay],
      },
    };
  }
}

export default RandomComputerPlayer;

import { createLogger, type ILogger } from "../../../../logger/Logger";
import Bot from "./Bot";
import type { VisibleTable } from "../../../../domain/table/visibleTable";
import type { VisiblePlayers } from "./visiblePlayers";
import type { CardRules } from "../../rules";
import type { PlayerAction } from "./Player";
import {type ICard} from "../../../../domain/card/Card";
import { USER_ACTIONS } from "../../../../types";

class LinearComputerPlayer extends Bot {
  constructor(private waitingTime: number, logger: ILogger = createLogger("Linear Bot")) {
    super("Linear", logger);
  }

  private exchangeCards(cardRules: CardRules): (number | null)[] {
    const [playerHand, defenseHand] = this.getAllHands();
    const mixedCardsWithIndex: [ICard, number, boolean][] = [];
    playerHand!.cards.forEach((card, index) => {
      mixedCardsWithIndex.push([card!, index, false]);
    });
    defenseHand!.cards.forEach((card, index) => {
      mixedCardsWithIndex.push([card!, index, true]);
    });
    mixedCardsWithIndex.sort(([aCard], [bCard]) => {
      if (cardRules.xCanBePlayedAfterY({ x: aCard, y: bCard })) {
        return 1;
      } else {
        return -1;
      }
    });

    return mixedCardsWithIndex
      .splice(0, 3)
      .map(([_, index, isDefense]) => (isDefense ? index : null));
  }

  async play(
    round: number,
    table: VisibleTable,
    otherPlayers: VisiblePlayers,
    cardRules: CardRules,
    drawPileCards: number
  ): Promise<PlayerAction> {
    if (round === 0) {
      return {
        action: USER_ACTIONS.EXCHANGE,
        data: {
          exchange: this.exchangeCards(cardRules),
        },
      };
    }

    await this.think(this.waitingTime);

    const [...rest] = this.getActiveHand().cards;

    if (rest.length === 0) {
      throw new Error("Shouldn't be here, no cards in active hand");
    }

    if (rest[0] === null) {
      return {
        action: USER_ACTIONS.PLAY_CARDS,
        data: {
          cardIndexes: [0],
        },
      };
    }

    const cardsToSort = rest
      .map((c, index): [ICard, number] => [c!, index]);

    cardsToSort.sort();

    const cardIndexesToPlay = [];
    const topCard = table.topCard();
    const firstPlayableCardIndexIndex = cardsToSort.findIndex(([c, index]) => {
      const t = !topCard || cardRules.xCanBePlayedAfterY({ x: c!, y: topCard });
      if (t) {
        this.logger.info(`${this.name} ${c} can be played after ${topCard}`);
      }
      return t;
    });

    if (firstPlayableCardIndexIndex === -1) {
      return {
        action: USER_ACTIONS.NP,
      };
    }

    const firstCardNumber = cardsToSort[firstPlayableCardIndexIndex][0].number;

    let i = firstPlayableCardIndexIndex;

    while (i < rest.length && cardsToSort[i] && firstCardNumber === cardsToSort[i][0]!.number) {
      cardIndexesToPlay.push(cardsToSort[i][1]);
      i++;
    }

    this.logger.info(
      `Playing ${rest} ${cardIndexesToPlay} ${
        rest[cardIndexesToPlay[0]]
      } as there's a ${topCard} on top`
    );
    return {
      action:
        cardIndexesToPlay.length === 4
          ? USER_ACTIONS.DISCARD_CARDS
          : USER_ACTIONS.PLAY_CARDS,
      data: {
        cardIndexes: cardIndexesToPlay,
      },
    };
  }
}

export default LinearComputerPlayer;

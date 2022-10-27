import { ILogger } from "../logger/Logger";
import Bot from "./Bot";
import { VisibleTable } from "../table/visibleTable";
import { VisiblePlayers } from "./visiblePlayers";
import { CardRules } from "../game_rules/trix";
import { PlayerAction } from "./Player";
import { USER_ACTIONS } from "../user_input/UserInput";
import Card, { cardComparisonFunction } from "../card/Card";

class LinearComputerPlayer extends Bot {
  constructor(logger: ILogger) {
    super(logger, "Linear");
  }

  private exchangeCards(cardRules: CardRules): (number | null)[] {
    const [playerHand, defenseHand] = this.getAllHands();
    const mixedCardsWithIndex: [Card, number, boolean][] = [];
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

    await this.think(500);

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
      .map((c, index): [Card, number] => [c!, index]);

    cardsToSort.sort((a, b) => cardComparisonFunction(a[0], b[0]));

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

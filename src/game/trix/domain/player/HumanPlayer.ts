import Player, { type PlayerAction, TypeOfPlayer } from "./Player";
import type UserInput from "../../../../IO/user_input/UserInput";
import type { Menu } from "../../menu/menu";
import { USER_ACTIONS } from "../../../../types";

class HumanPlayer extends Player {
  input: UserInput;
  menu: Menu;
  typeOfPlayer: TypeOfPlayer = TypeOfPlayer.Human;

  constructor({ name, menu, input }: { name: string, menu: Menu; input: UserInput }) {
    super({ name });
    this.input = input;
    this.menu = menu;
  }

  private async selectCards(
    cardNumberStr: string,
    choseByIndex: boolean
  ): Promise<PlayerAction> {
    const playerCurrentHand = this.getActiveHand();
    let cards = playerCurrentHand.cards
      .map((c, index) => ({ card: c, index }))
      .filter(({ card, index }) =>
        choseByIndex
          ? index === parseInt(cardNumberStr, 10)
          : `${card!.symbol}` === cardNumberStr
      );

    if (cards.length === 0) {
      return {
        action: USER_ACTIONS.NP,
        error: true,
      };
    }
    if (cards.length > 1) {
      const answer = await this.input.askUserForNumber(
        `There are ${cards.length} card with number ${cardNumberStr}, how many do you want to play?`,
        {}
      );
      cards = cards.slice(0, answer);
    }

    if (cards.length === 4) {
      return {
        action: USER_ACTIONS.DISCARD_CARDS,
        data: {
          cardIndexes: cards.map(({ index }) => index),
        },
      };
    }

    return {
      action: USER_ACTIONS.PLAY_CARDS,
      data: {
        cardIndexes: cards.map(({ index }) => index),
      },
    };
  }

  private async selectExchange() {
    const card1Index = (await this.menu.askForInitialCardExchange(0)).second;
    const card2Index = (await this.menu.askForInitialCardExchange(1)).second;
    const card3Index = (await this.menu.askForInitialCardExchange(2)).second;

    return [card1Index, card2Index, card3Index];
  }

  async play(round: number): Promise<PlayerAction> {
    if (round === 0) {
      return {
        action: USER_ACTIONS.EXCHANGE,
        data: {
          exchange: await this.selectExchange(),
        },
      };
    }
    const shouldSelectByIndex = !this.getActiveHand().visible;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      // loop until one action has been taken
      let order;
      while (!order) {
        order = await this.menu.askForTurnAction(this, shouldSelectByIndex);
      }

      switch (order) {
        case USER_ACTIONS.WHAT_TO_PLAY:
        case USER_ACTIONS.GET_ALL:
          return {
            action: order,
          };
        case USER_ACTIONS.SORT_HAND:
          this.getPlayerHand().sort();
          return {
            action: order,
          };
        default:
          // eslint-disable-next-line no-case-declarations
          const { action, data, error } = await this.selectCards(
            order,
            shouldSelectByIndex
          );
          if (!error) {
            return {
              action,
              data,
            };
          }
      }
    }
  }
}

export default HumanPlayer;

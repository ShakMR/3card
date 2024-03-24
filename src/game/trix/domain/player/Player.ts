import Hand from '../hand';
import type { PlayerHand, DefenseHand, SecretHand } from "../hand/";
import type ICard from "../../../../domain/card/Card";
import type { VisiblePlayers } from "./visiblePlayers";
import type { VisibleTable } from "../../../../domain/table/visibleTable";
import type { CardRules } from "../../rules";
import type { USER_ACTIONS } from "../../../../types";

export type PlayerAction = {
  action: USER_ACTIONS;
  error?: boolean;
  data?: {
    cardIndexes?: number[];
    exchange?: (number | null)[];
  };
};

export enum TypeOfPlayer {
  Human,
  Bot,
}

abstract class Player {
  name: string;
  handPriority: number;
  hands: [PlayerHand | null, DefenseHand | null, SecretHand | null];
  abstract typeOfPlayer: TypeOfPlayer;

  constructor({ name }: { name: string }) {
    this.name = name;
    this.handPriority = 0;

    this.hands = [null, null, null];
  }

  getHand(priority: number) {
    return this.hands[priority];
  }

  /**
   *
   * @returns {PlayerHand}
   */
  getPlayerHand() {
    const hand = this.hands[0];
    if (!hand) {
      throw new Error("Shouldn't be here. No player hand found");
    }
    return hand;
  }

  hasFinished() {
    const hand = this.hands.find((h) => h && h.cards.length > 0);
    return !hand;
  }

  getActiveHand(): Hand {
    const hand = this.hands.find((h) => h && h.cards.length > 0);
    if (!hand) {
      throw new Error("Shouldn't be here. No active hand found");
    }
    return hand;
  }

  getAllHands() {
    return this.hands;
  }

  setHand(priority: number, hand: Hand) {
    this.hands[priority] = hand;
  }

  getCards({ cardIndexes }: { cardIndexes: number[] }) {
    return this.getActiveHand().playCard(cardIndexes);
  }

  addCard(card: ICard, handPrio: number) {
    this.getHand(handPrio)?.addCard(card);
  }

  returnCard(card: ICard) {
    const hand = this.getActiveHand() || this.hands[this.hands.length - 1];
    if (hand.returnOnFail) {
      return hand.addCard(card);
    } else {
      return this.getPlayerHand().addCard(card);
    }
  }

  abstract play(
    round: number,
    table: VisibleTable,
    otherPlayers: VisiblePlayers,
    cardRules: CardRules,
    drawPileCards: number
  ): Promise<PlayerAction>;
}

export default Player;

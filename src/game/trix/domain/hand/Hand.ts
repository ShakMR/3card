import type ICard from "../../../../domain/card/Card";
import type { IHand } from "./IHand";

type HandProps = {
  cards?: ICard[];
  limit?: number;
  visible?: boolean;
  canPlayMultiple?: boolean;
  returnOnFail?: boolean;
  priority: number;
};

class Hand implements IHand {
  private readonly _cards: ICard[];
  limit?: number;
  visible: boolean;
  canPlayMultiple: boolean;
  returnOnFail: boolean;
  priority: number;

  constructor({
    cards = [],
    limit,
    visible = true,
    canPlayMultiple = true,
    returnOnFail = false,
    priority,
  }: HandProps) {
    this._cards = cards;
    this.limit = limit;
    this.visible = visible;
    this.priority = priority;
    this.returnOnFail = returnOnFail;
    this.canPlayMultiple = canPlayMultiple;
  }

  getPriority() {
    return this.priority;
  }

  isLimitReached() {
    return !!(this.limit && this.limit <= this._cards.length);
  }

  get cards(): ICard[] | null[] {
    return this.visible ? this._cards : this._cards.map(() => null);
  }

  getCard(index: number): ICard | null {
    return this.visible ? this._cards[index] : null;
  }

  addCard(card: ICard) {
    if (!this.limit || this.limit >= this._cards.length) {
      this._cards.push(card);
      return this._cards.length - (this.limit || 0);
    } else {
      throw new Error("Cannot add more cards");
    }
  }

  replaceCard(card: ICard, index: number) {
    this._cards[index] = card;
  }

  playCard(indexes: number[]) {
    return indexes.reverse().map((index) => this._cards.splice(index, 1)[0]);
  }

  isEmpty() {
    return this._cards.length === 0;
  }
}

export default Hand;

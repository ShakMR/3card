import Card from "../card/Card";

type HandProps = {
  cards?: Card[];
  limit?: number;
  visible?: boolean;
  canPlayMultiple?: boolean;
  returnOnFail?: boolean;
  priority: number;
}

class Hand {
  private readonly _cards: Card[];
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
    return this.limit && this.limit <= this._cards.length;
  }

  get cards(): Card[] | null[] {
    return this.visible ? this._cards : this._cards.map(() => null);
  }

  getCard(index: number): Card | null {
    return this.visible ? this._cards[index] : null;
  }

  addCard(card: Card) {
    if (!this.limit || this.limit >= this._cards.length) {
      this._cards.push(card);
      return this._cards.length - (this.limit || 0);
    } else {
      throw new Error("Cannot add more cards");
    }
  }

  playCard(indexes: number[]) {
    return indexes.reverse().map((index) => this._cards.splice(index, 1)[0])
  }

  isEmpty() {
    return this._cards.length === 0;
  }

  toString() {
    return this.visible ? this._cards.map(c => c.toString()) : 'X-X';
  }
}

export default Hand;

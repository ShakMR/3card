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
  cards: Card[];
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
    this.cards = cards;
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
    return this.limit && this.limit <= this.cards.length;
  }

  getCard(index: number) {
    if (this.visible) {
      return this.cards[index];
    }
  }

  addCard(card: Card) {
    if (!this.limit || this.limit >= this.cards.length) {
      this.cards.push(card);
      return this.cards.length - (this.limit || 0);
    } else {
      throw new Error("Cannot add more cards");
    }
  }

  playCard(indexes: number[]) {
    return indexes.reverse().map((index) => this.cards.splice(index, 1)[0])
  }

  isEmpty() {
    return this.cards.length === 0;
  }

  toString() {
    return this.visible ? this.cards.map(c => c.toString()) : 'X-X';
  }
}

export default Hand;

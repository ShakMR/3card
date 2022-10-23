abstract class Card {
  number: number;
  suit: string;

  constructor(number: number, suit: string) {
    this.number = number;
    this.suit = suit;
  }

  abstract get symbol(): string | number;
  abstract get suitSymbol(): string;

  toString() {
    return `${this.number}-${this.suit}`;
  }

  valueOf() {
    return this.number;
  }
}

export function cardComparisonFunction<T>(cardA: Card, cardB: Card) {
  return cardA.number - cardB.number;
}

export default Card;

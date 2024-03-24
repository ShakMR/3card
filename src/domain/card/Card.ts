export interface ICard {
  number: number;
  suit: string;
  symbol: string | number;
  suitSymbol: string;
  toString: () => string;
}

abstract class Card implements ICard {
  number: number;
  suit: string;

  constructor(number: number, suit: string) {
    this.number = number;
    this.suit = suit;
  }

  abstract get symbol(): string | number;
  abstract get suitSymbol(): string;

  toString() {
    return `${this.number}`;
  }
}

export default Card;

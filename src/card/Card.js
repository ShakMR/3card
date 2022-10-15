const rules = require('./cardRules');
const symbolMap = require('./cardSymbolMap.json');
const suitSymbolMap = require('./suitSymbolMap.json');

class Card {
  constructor(number, suit) {
    this.number = number;
    this.suit = suit;
  }

  get symbol() {
    return symbolMap[this.number];
  }

  get suitSymbol() {
    return suitSymbolMap[this.suit];
  }

  canBePlayedAfter(number) {
    return rules.canPlayXAfterAnyOfY[this.number].includes(number);
  }

  getValidNext() {
    return rules.afterXCanPlayAnyOf[this.number]
  }

  show() {
    console.log("_____");
    console.log(`_${symbolMap[this.number]} ${this.number === 10 ? '' : ' '}_`);
    console.log("_   _");
    console.log(`_  ${this.suit}_`);
    console.log("_____");
  }

  toString() {
    return `${this.number}-${this.suit}`;
  }

  valueOf() {
    return this.number;
  }

}

Card.cardComparisonFunction = () => (cardA, cardB) => cardA.number - cardB.number;

module.exports = Card;

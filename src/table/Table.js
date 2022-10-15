import RESOLUTIONS from '../resolutions'

class Table {
  constructor() {
    this.gameStack = [];
    this.discardStack = [];
  }

  topCard() {
    return this.gameStack[0];
  }

  eatStack() {
    while (this.gameStack[0] && this.gameStack[0].number === 3) {
      const card = this.gameStack.splice(0,1);
      this.discardStack.push(card);
    }
    return this.gameStack.splice(0);
  }

  playCard(cards) {
    const resolution = this.resolve(cards);
    if (![RESOLUTIONS.NOPE, RESOLUTIONS.SAME].includes(resolution)) {
      this.gameStack.splice(0,0, ...cards);
    }
    return resolution;
  }

  discardGameCards() {
    this.discardStack.push(...this.gameStack)
    this.gameStack = [];
  }

  show() {
    if (this.gameStack.length > 1) {
      this.gameStack[0].show();
    } else {
      console.log("EMPTY");
    }
  }

  resolve(cards) {
    const currentCard = this.gameStack[0];
    const topPlayedCards = cards[0];
    const canBePlayed = currentCard ? topPlayedCards.canBePlayedAfter(currentCard.number) : true;
    if (!canBePlayed) {
      return RESOLUTIONS.NOPE;
    }

    if (topPlayedCards.number === 10) {
      this.discardStack.push(...cards);
      this.discardGameCards();
      return RESOLUTIONS.SAME;
    }

    if (this.canDiscard(cards)) {
      const nToDiscardFromStack = 4 - cards.length;
      const cardsFromStack = this.gameStack.splice(0, nToDiscardFromStack);
      this.discardStack.push(...cardsFromStack, ...cards);
      return RESOLUTIONS.SAME;
    }

    if (currentCard && cards[0].number === currentCard.number) {
      return RESOLUTIONS.JUMP;
    }

    return RESOLUTIONS.NEXT;
  }

  canDiscard(cards) {
    const nPlayedCards = cards.length;
    const playedCardNumber = cards[0].number;
    let equalValue = true;
    for (let i = 0; i < 4 - nPlayedCards && equalValue; i++) {
      const currentStackCard = this.gameStack[i];
      equalValue = currentStackCard && currentStackCard.number === playedCardNumber;
    }

    return equalValue;
  }

  discardCards(cards) {
    this.discardStack.push(...cards);
  }
}

export default Table;

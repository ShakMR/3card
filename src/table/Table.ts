import { resolutions } from '../resolutions'
import Card from "../card/Card";

class Table {
  gameStack: Card[] = [];
  discardStack: Card[] = [];

  topCard() {
    return this.gameStack[0];
  }

  eatStack() {
    while (this.gameStack[0] && this.gameStack[0].number === 3) {
      const [card] = this.gameStack.splice(0,1);
      this.discardStack.push(card);
    }
    return this.gameStack.splice(0);
  }

  playCard(cards: Card[]) {
    const resolution = this.resolve(cards);
    if (![resolutions.NOPE, resolutions.SAME].includes(resolution)) {
      this.gameStack.splice(0,0, ...cards);
    }
    return resolution;
  }

  discardGameCards() {
    this.discardStack.push(...this.gameStack)
    this.gameStack = [];
  }

  resolve(cards: Card[]) {
    const currentCard = this.gameStack[0];
    const topPlayedCards = cards[0];
    const canBePlayed = currentCard ? topPlayedCards.canBePlayedAfter(currentCard.number) : true;
    if (!canBePlayed) {
      return resolutions.NOPE;
    }

    if (topPlayedCards.number === 10) {
      this.discardStack.push(...cards);
      this.discardGameCards();
      return resolutions.SAME;
    }

    if (this.canDiscard(cards)) {
      const nToDiscardFromStack = 4 - cards.length;
      const cardsFromStack = this.gameStack.splice(0, nToDiscardFromStack);
      this.discardStack.push(...cardsFromStack, ...cards);
      return resolutions.SAME;
    }

    if (currentCard && cards[0].number === currentCard.number) {
      return resolutions.JUMP;
    }

    return resolutions.NEXT;
  }

  canDiscard(cards: Card[]) {
    const nPlayedCards = cards.length;
    const playedCardNumber = cards[0].number;
    let equalValue = true;
    for (let i = 0; i < 4 - nPlayedCards && equalValue; i++) {
      const currentStackCard = this.gameStack[i];
      equalValue = currentStackCard && currentStackCard.number === playedCardNumber;
    }

    return equalValue;
  }

  discardCards(cards: Card[]) {
    this.discardStack.push(...cards);
  }
}

export default Table;

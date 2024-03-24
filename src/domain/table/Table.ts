import ICard from "../card/Card";

class Table {
  gameStack: ICard[] = [];
  discardStack: ICard[] = [];

  topCard() {
    return this.gameStack[0];
  }

  getStack() {
    while (this.gameStack[0] && this.gameStack[0].number === 3) {
      const [card] = this.gameStack.splice(0, 1);
      this.discardStack.push(card);
    }
    return this.gameStack.splice(0);
  }

  discardCardsFromStack(howMany: number) {
    const cards = this.gameStack.splice(0, howMany);
    this.discardCards(cards);
  }

  playCards(cards: ICard[]) {
    this.gameStack.splice(0, 0, ...cards);
  }

  discardGameCards() {
    this.discardStack.push(...this.gameStack);
    this.gameStack = [];
  }

  discardCards(cards: ICard[]) {
    this.discardStack.push(...cards);
  }
}

export default Table;

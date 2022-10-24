import Hand from './Hand'
import Card, { cardComparisonFunction } from '../card/Card'

class PlayerHand extends Hand {
  shouldHaveCards: number;

  constructor() {
    super({
      priority: 1,
      limit: 52,
      returnOnFail: true
    });
    this.shouldHaveCards = 3;
  }

  hasEnoughCards() {
    return this.shouldHaveCards <= this.cards.length
  }

  howManyCardsShouldHave() {
    return this.shouldHaveCards;
  }

  sort() {
    this.cards.sort(cardComparisonFunction);
  }

  addCard(card: Card): number {
    return super.addCard(card);
  }
}

export default PlayerHand;

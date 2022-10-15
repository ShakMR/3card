class Player {
  constructor({ name }) {
    this.name = name;
    this.handPriority = 0;
    /** @type [PlayerHand, DefenseHand, SecretHand] */
    this.hands = [null, null, null]
  }

  getHand(priority) {
    return this.hands[priority];
  }

  /**
   *
   * @returns {PlayerHand}
   */
  getPlayerHand() {
    return this.hands[0];
  }

  /**
   * @returns {Hand}
   */
  getActiveHand() {
    return this.hands.find((h) => h.cards.length > 0);
  }

  getAllHands() {
    return this.hands;
  }

  setHand(priority, hand) {
    this.hands[priority] = hand;
  }

  canPlaySomething(number) {
    return this.getActiveHand().cards.some((c) => c.canBePlayedAfter(number));
  }

  playCard({ handPriority = this.handPriority, cardIndexes }) {
    return this.getActiveHand().playCard(cardIndexes);
  }

  addCard(card, handPrio) {
    this.hands[handPrio].addCard(card);
  }

  returnCard(card) {
    const hand = this.getActiveHand() || this.hands[this.hands.length - 1];
    if (hand.returnOnFail) {
      return hand.addCard(card);
    } else {
      return this.hands[0].addCard(card);
    }
  }

  toString() {
    return `${this.name}: 
${this.hands.map(h => h.toString()).join(' | ')}`;
  }
}

module.exports = Player;

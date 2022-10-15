class Hand {
  constructor({
    cards = [],
    limit = null,
    visible = true,
    canPlayMultiple = true,
    returnOnFail = false,
    priority,
  }) {
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
    return this.limit <= this.cards.length;
  }

  getCard(index) {
    if (this.visible) {
      return this.cards[index];
    }
  }

  addCard(card) {
    if (!this.limit || this.limit >= this.cards.length) {
      this.cards.push(card);
      return this.cards.length - this.limit;
    } else {
      throw new Error("Cannot add more cards");
    }
  }

  /**
   *
   * @param {number[]} indexes
   * @returns {Card[]}
   */
  playCard(indexes) {
    return indexes.reverse().map((index) => this.cards.splice(index, 1)[0])
  }

  isEmpty() {
    return this.cards.length === 0;
  }

  show() {
    this.cards.forEach((c, index) => {
      console.log(index, "-----");
      c.show();
    })
  }

  toString() {
    return this.visible ? this.cards.map(c => c.toString()) : 'X-X';
  }
}

module.exports = Hand;

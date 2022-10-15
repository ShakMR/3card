const Hand = require('./Hand');

class DefenseHand extends Hand {
  constructor() {
    super({
      shouldHaveCards: 3,
      limit: 3,
      returnOnFail: true,
      isBlocked: true,
      priority: 1,
    });
  }
}

module.exports = DefenseHand;

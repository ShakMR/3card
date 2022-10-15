const Hand = require('./Hand');

class SecretHand extends Hand {
  constructor() {
    super({
      shouldHaveCards: 3,
      limit: 3,
      isBlocked: true,
      priority: 2,
      visible: false,
    });
  }
}

module.exports = SecretHand;

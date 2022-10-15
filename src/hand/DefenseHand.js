import Hand from './Hand'

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

export default DefenseHand;

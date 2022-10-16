import Hand from './Hand'

class DefenseHand extends Hand {
  constructor() {
    super({
      limit: 3,
      returnOnFail: true,
      priority: 1,
    });
  }
}

export default DefenseHand;

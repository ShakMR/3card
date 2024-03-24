import Hand from "./Hand";

class SecretHand extends Hand {
  constructor() {
    super({
      limit: 3,
      priority: 2,
      visible: false,
    });
  }
}

export default SecretHand;

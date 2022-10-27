import PokerCard, { Suit } from "../card/PokerCard";
import Deck, { DeckConfig } from "./Deck";

const config: DeckConfig = {
  [Suit.S]: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
  [Suit.H]: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
  [Suit.C]: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
  [Suit.D]: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
};

class PokerDeck extends Deck {
  constructor() {
    super(config);
  }

  init() {
    super.init((number: number, suit: Suit) => new PokerCard(number, suit));
  }
}

export default PokerDeck;

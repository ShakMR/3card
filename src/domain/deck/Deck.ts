import ICard from "../card/Card";

function shuffle<T>(array: T[]) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex !== 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

export type DeckConfig = Record<string, number[]>;

class Deck {
  cards: ICard[] = [];
  deckDefinition: DeckConfig;

  constructor(deckDefinition: DeckConfig) {
    this.deckDefinition = deckDefinition;
  }

  // TODO fix this type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  init(createCardInstance: (...args: any) => ICard) {
    const tempDeck: ICard[] = [];
    Object.entries(this.deckDefinition).forEach(([suit, numbers]) => {
      numbers.forEach((number: number) => {
        tempDeck.push(createCardInstance(number, suit));
      });
    });

    this.cards = tempDeck;
  }

  shuffle() {
    this.cards = shuffle(this.cards);
  }

  pickCard() {
    return this.cards.pop();
  }
}

export default Deck;

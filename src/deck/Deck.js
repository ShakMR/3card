const Card = require('../card/Card');
const deckConfig = require('./deck.json');

function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex !== 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

class Deck {
  constructor() {
    this.cards = [];
  }

  init() {
    const tempDeck = []
    Object.entries(deckConfig).forEach(([suit, numbers]) => {
      numbers.forEach((number) => {
        tempDeck.push(new Card(number, suit));
      });
    });

    this.cards = shuffle(tempDeck);
  }

  pickCard() {
    return this.cards.splice(0, 1)[0];
  }
}

module.exports = Deck;

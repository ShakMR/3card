const Display = require('./Display');

const styles = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  underscore: "\x1b[4m",
  blink: "\x1b[5m",
  reverse: "\x1b[7m",
  hidden: "\x1b[8m",
}

const fontColor = {
  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
}

const backGroundColor = {
  black: "\x1b[40m",
  red: "\x1b[41m",
  green: "\x1b[42m",
  yellow: "\x1b[43m",
  blue: "\x1b[44m",
  magenta: "\x1b[45m",
  cyan: "\x1b[46m",
  white: "\x1b[47m",
}

const cardLine = (symbol = null, side = 'left', color=fontColor.black) => {
  const leftSymbol = symbol && side === 'left' ? symbol : !symbol || side === 'right' ? '  ' : ' ';
  const rightSymbol = symbol && side === 'right' ? symbol : ' ';
  const middleSymbol = symbol && side === 'middle' ? symbol : ' ';

  return `${backGroundColor.white}${color} ${leftSymbol}${middleSymbol}${rightSymbol} ${styles.reset}`
}

const cardSymbolLine = (card, visible = true) => {
  const symbol = card.number !== 10 ? `${card.symbol} ` : card.symbol;
  return cardLine(visible && symbol, 'left')
}

const cardSuitsLine = (card, visible) => {
  let color = fontColor.red;
  if (['S','C'].includes(card.suit)) {
    color = fontColor.black
  }
  return cardLine(visible && card.suitSymbol, 'right', color)

}

const range = (i, j) => {
  const r = [];
  for (i; i < j; i++) {
    r.push(i);
  }
  return r;
}

/**
 *
 * @param {Hand[]} hands
 * @param {boolean} reverse
 * @param {boolean} showPlayerHand
 * @returns {*}
 */
const handCardsHorizontal = (hands, reverse = false, showPlayerHand = false) => {
  const display = hands.filter((hand) => hand).map((hand, index) => {
    const shouldCardBeVisible = hand.visible && (index !== 0 || showPlayerHand);
    const handsSymbols = hand.cards.map((c) => cardSymbolLine(c, shouldCardBeVisible)).join('  ');
    const handsSuits = hand.cards.map((c) => cardSuitsLine(c, shouldCardBeVisible)).join('  ');
    const topSymbols = !reverse ? handsSymbols : handsSuits;
    const bottomSymbols = !reverse ? handsSuits : handsSymbols;
    const numberHeader = range(0, hand.cards.length).map((i) => `${i < 10 ? `${i} ` : i}    `).join('  ');
    const header = range(0, hand.cards.length).map(() => cardLine()).join('  ');
    const center = range(0, hand.cards.length).map(() => cardLine()).join('  ');
    return `
${numberHeader}
${header}
${topSymbols}
${center}
${bottomSymbols}
${header}`
  });

  return reverse ? display.reverse() : display;
}

const tableTopCardSymbol = (card) => {
  return card ? cardSymbolLine(card, 'left') : cardLine(card, 'left');
}

const tableTopCardSuit = (card) => {
  return cardLine(card && card.suitSymbol, 'right')
}

/**
 * @param {number} turn
 * @param {Player[]} players
 * @param {Table} table
 * @param {Deck} deck
 */
const onePlayerTable = (turn, players, table, deck) => {
  const topCard = table.topCard();
  const hands = players[turn].getAllHands();

  const deckString = deck.cards.length >= 10 ?  deck.cards.length : '0' + deck.cards.length;

  const handsDisplay = handCardsHorizontal(hands, false, true);
  console.log(`
  ${cardLine()}    ${cardLine()}
  ${cardLine()}    ${tableTopCardSymbol(topCard)}
  ${cardLine(deckString, 'middle')}    ${cardLine()}
  ${cardLine()}    ${tableTopCardSuit(topCard)}
  ${cardLine()}    ${cardLine()}

${handsDisplay.join('')}
`);
}

const twoPlayerTable = (turn, players, table, deck, hide = false) => {
  const topCard = table.topCard();
  const playingNow = players[turn];
  const contrary = players[(turn + 1)% players.length]
  const hands = playingNow.getAllHands();
  const contraryHands = contrary.getAllHands();

  const deckString = deck.cards.length >= 10 ?  deck.cards.length : '0' + deck.cards.length;

  console.log(`
${handCardsHorizontal(contraryHands, true).join('')}
${contrary.name}


  ${cardLine()}    ${cardLine()}
  ${cardLine()}    ${tableTopCardSymbol(topCard)}
  ${cardLine(deckString, 'middle')}    ${cardLine()}
  ${cardLine()}    ${tableTopCardSuit(topCard)}
  ${cardLine()}    ${cardLine()}

${playingNow.name}
${handCardsHorizontal(hands, false, !hide).join('')}
`);
}

const threePlayerTable = (turn, players, table) => {

}

const fourPlayerTable = (turn, players, table) => {

}

const tableDisplayFuncs = [
  null,
  onePlayerTable,
  twoPlayerTable,
  threePlayerTable,
  fourPlayerTable,
];

class Terminal extends Display {
  constructor() {
    super();
  }

  displayCurrentPlayerStatus({ turn, players, table, deck, hidden }) {
    const nPlayers = players.length;

    tableDisplayFuncs[nPlayers](turn, players, table, deck, hidden);
  }

  endGame(winner) {
    this.clear();
    console.log(styles.blink, `WINNER ${winner.name.toUpperCase()}`, styles.reset)
  }

  /**
   *
   * @param {string[]} messages
   */
  showMessage(messages) {
    if (messages.length > 0) {
      messages.forEach((message) => {
        console.log(`${fontColor.red} ${styles.underscore}${message}${styles.reset}`)
      })
    }
  }

  clear() {
    console.clear();
  }
}

module.exports = Terminal;

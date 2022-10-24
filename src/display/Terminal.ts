import Display, { Status } from "./Display";
import Card from "../card/Card";
import Player, { TypeOfPlayer } from "../player/Player";
import Hand from "../hand/Hand";

enum Styles {
    reset = "\x1b[0m",
    bright = "\x1b[1m",
    dim = "\x1b[2m",
    underscore = "\x1b[4m",
    blink = "\x1b[5m",
    reverse = "\x1b[7m",
    hidden = "\x1b[8m",
};

enum FontColor {
    black = "\x1b[30m",
    red = "\x1b[31m",
    green = "\x1b[32m",
    yellow = "\x1b[33m",
    blue = "\x1b[34m",
    magenta = "\x1b[35m",
    cyan = "\x1b[36m",
    white = "\x1b[37m",
}

enum BGColor {
    black = "\x1b[40m",
    red = "\x1b[41m",
    green = "\x1b[42m",
    yellow = "\x1b[43m",
    blue = "\x1b[44m",
    magenta = "\x1b[45m",
    cyan = "\x1b[46m",
    white = "\x1b[47m",
}

type CardLineParams = {
    symbol?: string,
    side?: "left" | "right" | "middle",
    color?: FontColor
}

const cardLine = ({symbol, side = "left", color = FontColor.black}: CardLineParams) => {
    const leftSymbol = symbol && side === "left" ? symbol : !symbol || side === "right" ? "  " : " ";
    const rightSymbol = symbol && side === "right" ? symbol : " ";
    const middleSymbol = symbol && side === "middle" ? symbol : " ";

    return `${BGColor.white}${color} ${leftSymbol}${middleSymbol}${rightSymbol} ${Styles.reset}`;
};

type CardLine = {
    card: Card | null,
    visible: boolean,
}

const cardSymbolLine = ({card, visible = true}: CardLine) => {
    const symbol = card?.number !== 10 ? `${card?.symbol} ` : `${card.symbol}`;
    return cardLine({symbol: visible ? symbol : undefined, side: "left"});
};

const cardSuitsLine = ({card, visible}: CardLine) => {
    let color = FontColor.red;
    if (card && ["S", "C"].includes(card.suit)) {
        color = FontColor.black;
    }
    return cardLine({symbol: visible ? card?.suitSymbol : undefined, side: "right", color});
};

const range = (i: number, j: number): number[] => {
    const r = [];
    for (i; i < j; i++) {
        r.push(i);
    }
    return r;
};

/**
 *
 * @param {Hand[]} hands
 * @param {boolean} reverse
 * @param {boolean} showPlayerHand
 * @returns {*}
 */
const handCardsHorizontal = ({
    hands,
    reverse = false,
    showPlayerHand = false
}: { hands: Array<Hand | null>, reverse?: boolean, showPlayerHand?: boolean }) => {
    const display = hands.filter((hand: Hand | null) => hand).map((hand: Hand | null, index: number) => {
        if (!hand) return;
        const shouldCardBeVisible = hand.visible && (index !== 0 || showPlayerHand);
        const handsSymbols = hand.cards.map((c) => cardSymbolLine({card: c, visible: shouldCardBeVisible})).join("  ");
        const handsSuits = hand.cards.map((c) => cardSuitsLine({card: c, visible: shouldCardBeVisible})).join("  ");
        const topSymbols = !reverse ? handsSymbols : handsSuits;
        const bottomSymbols = !reverse ? handsSuits : handsSymbols;
        const numberHeader = range(0, hand.cards.length).map((i) => `${i < 10 ? `${i} ` : i}    `).join("  ");
        const header = range(0, hand.cards.length).map(() => cardLine({})).join("  ");
        const center = range(0, hand.cards.length).map(() => cardLine({})).join("  ");
        return `
${numberHeader}
${header}
${topSymbols}
${center}
${bottomSymbols}
${header}`;
    });

    return reverse ? display.reverse() : display;
};

const tableTopCardSymbol = (card: Card) => {
    return card ? cardSymbolLine({card, visible: true}) : cardLine({side: "left"});
};

const tableTopCardSuit = (card: Card) => {
    return cardLine({symbol: card && card.suitSymbol, side: "right"});
};


function onePlayerTable<C extends Card>({table, players, turn, deck}: Status, showBotsHand: boolean): void {
    const topCard = table.topCard();
    const hands = players[turn].getAllHands();

    const deckString = deck.cards.length >= 10 ? `${deck.cards.length}` : `0${deck.cards.length}`;

    const handsDisplay = handCardsHorizontal({hands, reverse: false, showPlayerHand: true});
    console.log(`
  ${cardLine({})}    ${cardLine({})}
  ${cardLine({})}    ${tableTopCardSymbol(topCard)}
  ${cardLine({symbol: deckString, side: "middle"})}    ${cardLine({})}
  ${cardLine({})}    ${tableTopCardSuit(topCard)}
  ${cardLine({})}    ${cardLine({})}

${handsDisplay.join("")}
`);
}

function twoPlayerTable<C extends Card>({table, players, turn, deck, hidden = false}: Status, showBotsHand: boolean): void {
    const topCard = table.topCard();
    const playingNow = players[turn];
    const contrary = players[(turn + 1) % players.length];
    const hands = playingNow.getAllHands();
    const contraryHands = contrary.getAllHands();

    const deckString = deck.cards.length >= 10 ? `${deck.cards.length}` : `0${deck.cards.length}`;

    let shouldShowHand = !hidden;

    if (playingNow.typeOfPlayer === TypeOfPlayer.Bot) {
        shouldShowHand = shouldShowHand && showBotsHand;
    }

    console.log(playingNow.typeOfPlayer, showBotsHand, hidden);
    console.log(`
${handCardsHorizontal({hands: contraryHands, reverse: true}).join("")}
${contrary.name}


  ${cardLine({})}    ${cardLine({})}
  ${cardLine({})}    ${tableTopCardSymbol(topCard)}
  ${cardLine({symbol: deckString, side: "middle"})}    ${cardLine({})}
  ${cardLine({})}    ${tableTopCardSuit(topCard)}
  ${cardLine({})}    ${cardLine({})}

${playingNow.name}
${handCardsHorizontal({hands, reverse: false, showPlayerHand: shouldShowHand}).join("")}
`);
}

const tableDisplayFuncs = [
    null,
    onePlayerTable,
    twoPlayerTable,
];

class Terminal extends Display {
    constructor() {
        super();
    }

    displayCurrentPlayerStatus(status: Status) {
        const nPlayers = status.players.length;

        const nHumanPlayers = status.players.reduce((acc, player) => acc + (player.typeOfPlayer === TypeOfPlayer.Human ? 1 : 0), 0)

        const funct = tableDisplayFuncs[nPlayers];

        if (funct) {
            funct(status, nHumanPlayers === 0);
        }
    }

    endGame(winner: Player) {
        this.clear();
        console.log(Styles.blink, `WINNER ${winner.name.toUpperCase()}`, Styles.reset);
    }

    showMessage(messages: string[]) {
        if (messages.length > 0) {
            messages.forEach((message) => {
                console.log(`${FontColor.red} ${Styles.underscore}${message}${Styles.reset}`);
            });
        }
    }

    clear() {
        console.clear();
    }
}

export default Terminal;

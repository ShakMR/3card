import Card from "./Card";

export enum Suit {
    S = "S",
    H = "H",
    C = "C",
    D = "D",
}

const suitSymbolMap: Record<Suit, string> = {
    [Suit.S]: "♠",
    [Suit.H]: "♥",
    [Suit.C]: "♣",
    [Suit.D]: "♦"
}

const cardSymbolMap: Array<string|number> = [0, "A", 2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K"];

class PokerCard extends Card {
    constructor(number: number, suit: Suit) {
        super(number, suit);
    }

    get symbol(): string | number {
        return cardSymbolMap[this.number];
    }

    get suitSymbol(): string {
        return suitSymbolMap[this.suit as Suit];
    }
}

export default PokerCard

import PokerCard from "../card/PokerCard";
import Table from "../table/Table";
import { Resolutions } from "../resolutions";
import Player from "../player/Player";

export const afterXCanPlayAnyOf: Record<number, number[]> = {
    1: [1, 2, 3, 10],
    3: [3],
    7: [2, 10, 3, 4, 5, 6, 7],
}

afterXCanPlayAnyOf["13"] = [...afterXCanPlayAnyOf["1"], 13];
afterXCanPlayAnyOf["12"] = [...afterXCanPlayAnyOf["13"], 12];
afterXCanPlayAnyOf["11"] = [...afterXCanPlayAnyOf["12"], 11];
afterXCanPlayAnyOf["9"] = [...afterXCanPlayAnyOf["11"], 9];
afterXCanPlayAnyOf["8"] = [...afterXCanPlayAnyOf["9"], 8];
afterXCanPlayAnyOf["6"] = [...afterXCanPlayAnyOf["8"], 7, 6];
afterXCanPlayAnyOf["5"] = [...afterXCanPlayAnyOf["6"], 5];
afterXCanPlayAnyOf["4"] = [...afterXCanPlayAnyOf["5"], 4];
afterXCanPlayAnyOf["2"] = [...afterXCanPlayAnyOf["4"]];

// X is the key Y the value, play key after a value has been played.
export const canPlayXAfterAnyOfY: Record<number, number[]> = {
    4: [2, 4, 7],
    8: [2, 4, 5, 6, 8],
    3: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
}

canPlayXAfterAnyOfY["5"] = [...canPlayXAfterAnyOfY["4"], 5];
canPlayXAfterAnyOfY["6"] = [...canPlayXAfterAnyOfY["5"], 6];
canPlayXAfterAnyOfY["7"] = [...canPlayXAfterAnyOfY["6"], 7];
canPlayXAfterAnyOfY["9"] = [...canPlayXAfterAnyOfY["8"], 9];
canPlayXAfterAnyOfY["11"] = [...canPlayXAfterAnyOfY["9"], 11];
canPlayXAfterAnyOfY["12"] = [...canPlayXAfterAnyOfY["11"], 12];
canPlayXAfterAnyOfY["13"] = [...canPlayXAfterAnyOfY["12"], 13];
canPlayXAfterAnyOfY["1"] = [...canPlayXAfterAnyOfY["13"], 1];
canPlayXAfterAnyOfY["10"] = [...canPlayXAfterAnyOfY["1"], 7];
canPlayXAfterAnyOfY["2"] = [...canPlayXAfterAnyOfY["1"], 7];

export interface CardRules {
    xCanBePlayedAfterY: ({ x, y }: { x: PokerCard, y: PokerCard }) => boolean;
    getValidCardsAfter: (x: PokerCard) => number[];
}

export const cardRules: CardRules = {
    xCanBePlayedAfterY: ({ x, y }: { x: PokerCard, y: PokerCard }) => {
        return canPlayXAfterAnyOfY[x.number].includes(y.number);
    },
    getValidCardsAfter: (x: PokerCard) => {
        return afterXCanPlayAnyOf[x.number];
    }
}

export type ActionResolution = {
    resolution: Resolutions,
    additionalData?: {
        cardsToDiscard?: number,
        discardPlayed?: boolean,
        discardStack?: boolean,
        playCards?: boolean,
    }
};

export interface TableRules {
    canPlayCards: (table: Table, cards: PokerCard[]) => boolean;
    canDiscard: (table: Table, cards: PokerCard[]) => boolean;
    resolveAction: (table: Table, cards: PokerCard[]) => ActionResolution;
    canPlaySomething: (table: Table, player: Player) => boolean;
}

export const tableRules = {
    canPlayCards: (table: Table, cards: PokerCard[]) => {
        const [topStackCard] = table.gameStack;
        const [firstPlayedCard] = cards;
        return !topStackCard || cardRules.xCanBePlayedAfterY({x: firstPlayedCard, y: topStackCard});
    },
    canDiscard: (table: Table, cards: PokerCard[]) => {
        const nPlayedCards = cards.length;
        const playedCardNumber = cards[0].number;
        const stack = table.gameStack;
        let equalValue = true;
        for (let i = 0; i < 4 - nPlayedCards && equalValue; i++) {
            const currentStackCard = stack[i];
            equalValue = currentStackCard && currentStackCard.number === playedCardNumber;
        }

        return equalValue;
    },
    resolveAction: (table: Table, cards: PokerCard[]): ActionResolution => {
        const topStackCard = table.topCard();
        const [firstPlayedCard] = cards;
        const canBePlayed = tableRules.canPlayCards(table, cards);

        if (!canBePlayed) {
            return {
                resolution: Resolutions.NOPE,
            };
        }

        if (firstPlayedCard.number === 10) {
            table.playCards(cards);
            table.discardGameCards();
            return {
                resolution: Resolutions.SAME,
                additionalData: {
                    discardStack: true,
                }
            };
        }

        const canDiscard = tableRules.canDiscard(table, cards);

        if (canDiscard) {
            return {
                resolution: Resolutions.SAME,
                additionalData: {
                    discardPlayed: true,
                    cardsToDiscard: 4 - cards.length,
                },
            };
        }

        if (topStackCard && firstPlayedCard.number === topStackCard.number) {
            return {
                resolution: Resolutions.JUMP,
            };
        }

        return {
            resolution: Resolutions.NEXT,
            additionalData: {
                playCards: true,
            },
        };
    },
    canPlaySomething: (table: Table, player: Player) => {
        const hand = player.getActiveHand();
        const topCard = table.topCard();

        return !topCard || hand.cards.some((c) => cardRules.xCanBePlayedAfterY({x: c, y: topCard}));
    },
}

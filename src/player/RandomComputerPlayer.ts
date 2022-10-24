import Player, { PlayerAction, TypeOfPlayer } from "./Player";
import { VisibleTable } from "../table/visibleTable";
import { VisiblePlayers } from "./visiblePlayers";
import { CardRules } from "../game_rules/trix";
import { USER_ACTIONS } from "../user_input/UserInput";
import { ILogger } from "../logger/Logger";

const {uniqueNamesGenerator, starWars, colors, adjectives} = require("unique-names-generator");

const getRandomPick = (array: number[]): number => {
    const pick = Math.floor(Math.random() * array.length);
    return array[pick];
};

const waitMilliseconds = (ms: number) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};

class RandomComputerPlayer extends Player {
    // it's just the numbers we can play, so we can select randomly
    public typeOfPlayer: TypeOfPlayer = TypeOfPlayer.Bot;


    constructor(private logger: ILogger) {
        const name = uniqueNamesGenerator({dictionaries: [adjectives, starWars], style: "capital", separator: " "})
        super({name: `Random ${name}`});
    }

    async play(round: number, table: VisibleTable, otherPlayers: VisiblePlayers, cardRules: CardRules, drawPileCards: number): Promise<PlayerAction> {
        if (round === 0) {
            return {
                action: USER_ACTIONS.NP
            }
        }

        await waitMilliseconds(500);
        const indexesToPlay = new Array<number>();
        const topCard = table.topCard();
        const activeHand = this.getActiveHand();
        if (activeHand.cards && activeHand.cards[0] !== null) {
            for (let [index, card] of activeHand.cards.entries()) {
                const canBePlayer = !topCard || cardRules.xCanBePlayedAfterY({x: card!, y: topCard});
                this.logger.info(`${this.name} tested if ${card} can be played on top of ${topCard} -> ${canBePlayer}`);
                if (canBePlayer) {
                    indexesToPlay.push(index);
                }
            }
        } else {
            activeHand.cards.forEach((c, i) => indexesToPlay.push(i))
        }

        const indexToPlay = getRandomPick(indexesToPlay);
        this.logger.info(`${this.name} plays ${activeHand.cards} ${indexToPlay} -> ${activeHand.cards?.[indexToPlay] || "SECRET"} on top of ${topCard}`)

        return {
            action: USER_ACTIONS.PLAY_CARDS,
            data: {
                cardIndexes: [indexToPlay],
            },
        };
    }
}

export default RandomComputerPlayer;

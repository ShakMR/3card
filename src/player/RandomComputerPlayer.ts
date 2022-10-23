import Player, { PlayerAction, TypeOfPlayer } from "./Player";
import { VisibleTable } from "../table/visibleTable";
import { VisiblePlayers } from "./visiblePlayers";
import { CardRules } from "../game_rules/trix";
import { USER_ACTIONS } from "../user_input/UserInput";
import { Logger } from "winston";
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
        super({name: uniqueNamesGenerator({dictionaries: [adjectives, starWars], style: "upperCase", separator: " "})});
    }

    async play(table: VisibleTable, otherPlayers: VisiblePlayers, cardRules: CardRules, drawPileCards: number): Promise<PlayerAction> {
        await waitMilliseconds(500);
        const indexesToPlay = new Array<number>();
        const topCard = table.topCard();
        const activeHand = this.getActiveHand();
        for (let [index, card] of activeHand.cards.entries()) {
            const canBePlayer = !topCard || cardRules.xCanBePlayedAfterY({x: card, y: topCard});
            this.logger.info(`${this.name} tested if ${card} can be played on top of ${topCard} -> ${canBePlayer}`);
            if (canBePlayer) {
                indexesToPlay.push(index);
            }
        }

        const indexToPlay = getRandomPick(indexesToPlay);
        this.logger.info(`${this.name} plays ${activeHand.cards} ${indexToPlay} -> ${activeHand.cards[indexToPlay]} on top of ${topCard}`)

        return {
            action: USER_ACTIONS.PLAY_CARDS,
            data: {
                cardIndexes: [indexToPlay],
            },
        };
    }
}

export default RandomComputerPlayer;

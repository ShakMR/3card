import Player, { PlayerAction } from "./Player";
import { VisibleTable } from "../table/visibleTable";
import { VisiblePlayers } from "./visiblePlayers";
import { CardRules } from "../game_rules/trix";
import { USER_ACTIONS } from "../user_input/UserInput";

const getRandomPick = (array: number[]) => {
    return array[Math.floor(Math.random()*array.length)];
}

class RandomComputerPlayer extends Player {
    // it's just the numbers we can play, so we can select randomly
    indexesToPlay: number[];


    constructor(props: { name: string }) {
        super(props);
        this.indexesToPlay = new Array<number>();
    }

    async play(table: VisibleTable, otherPlayers: VisiblePlayers, cardRules: CardRules, drawPileCards: number): Promise<PlayerAction> {
        const topCard = table.topCard();
        const activeHand = this.getActiveHand();
        for (let [index, card] of activeHand.cards.entries()) {
            if (cardRules.xCanBePlayedAfterY({ x: card, y: topCard })) {
                this.indexesToPlay.push(index);
            }
        }

        const indexToPlay = getRandomPick(this.indexesToPlay);

        return {
            action: USER_ACTIONS.PLAY_CARDS,
            data: {
                cardIndexes: [indexToPlay],
            },
        };
    }
}

export default RandomComputerPlayer;

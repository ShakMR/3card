import { VisibleTable } from "../../table/visibleTable";
import Card from "../../card/Card";
import LinearComputerPlayer from "../LinearComputerPlayer";
import { createLogger } from "../../logger/Logger";
import { VisiblePlayers } from "../visiblePlayers";
import { cardRules, CardRules } from "../../game_rules/trix";
import PlayerHand from "../../hand/PlayerHand";
import { USER_ACTIONS } from "../../user_input/UserInput";

class TestCard extends Card {
    get suitSymbol(): string {
        return "s";
    }

    get symbol(): string | number {
        return "s";
    }

}

const combMatrix: Array<[number, number[]]> = [
    //   1  2  3  4  5  6  7  8  9  10 11 12 13
    [1,  [1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1]],
    [2,  [1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1]],
    [3,  [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1]],
    [4,  [0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0]],
    [5,  [0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0]],
    [6,  [0, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0]],
    [7,  [0, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0]],
    [8,  [0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0]],
    [9,  [0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0]],
    [10, [1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1]],
    [11, [0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 0, 0]],
    [12, [0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0]],
    [13, [0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1]]
];

describe("LinearComputerPlayer", () => {
    combMatrix.forEach(([number, isPlayableOnTop]) => {
        isPlayableOnTop.forEach((canPlayTopNumber, index) => {
            it(`${number} can${canPlayTopNumber === 0 ? "not" : ""} be played on top of ${index+1}`, async () => {
                const table: VisibleTable = {
                    topCard: () => new TestCard(index + 1, "s"),
                };

                const players: VisiblePlayers = {
                    seeCards: () => undefined,
                    seeNumberOfCards: () => undefined
                }

                const linearComputerPlayer = new LinearComputerPlayer(createLogger("test"), 0);
                const hand = new PlayerHand();
                hand.addCard(new TestCard(number, "s"));
                linearComputerPlayer.setHand(0, hand);

                const {action, data} = await linearComputerPlayer.play(1, table, players, cardRules, 0);
                expect(action).toBe(canPlayTopNumber ? USER_ACTIONS.PLAY_CARDS : USER_ACTIONS.NP);
                if (canPlayTopNumber) {
                    expect(data).toEqual({cardIndexes: [0]});
                } else {
                    expect(data).toBeUndefined();
                }
            });
        })
    })
})

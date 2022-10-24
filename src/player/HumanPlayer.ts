import Player, { PlayerAction, TypeOfPlayer } from "./Player";
import UserInput, { USER_ACTIONS } from "../user_input/UserInput";
import { VisibleTable } from "../table/visibleTable";
import { VisiblePlayers } from "./visiblePlayers";
import { CardRules } from "../game_rules/trix";
import terminal from "../utils";

class HumanPlayer extends Player {
    input: UserInput;
    typeOfPlayer: TypeOfPlayer = TypeOfPlayer.Human;

    constructor({name, input}: { name: string, input: UserInput }) {
        super({name});
        this.input = input;
    }

    private async selectCards(cardNumberStr: string, choseByIndex: boolean): Promise<PlayerAction> {
        const playerCurrentHand = this.getActiveHand();
        let cards = playerCurrentHand.cards
            .map((c, index) => ({card: c, index}))
            .filter(({
                card,
                index
            }) => choseByIndex ? index === parseInt(cardNumberStr, 10) : `${card!.symbol}` === cardNumberStr);

        if (cards.length === 0) {
            return {
                action: "Error"
            };
        }
        if (cards.length > 1) {
            const answer = await terminal.askUserForNumber(`There are ${cards.length} card with number ${cardNumberStr}, how many do you want to play?`);
            cards = cards.slice(0, answer);
        }

        if (cards.length === 4) {
            return {
                action: USER_ACTIONS.DISCARD_CARDS,
                data: {
                    cardIndexes: cards.map(({index}) => index),
                }
            };
        }

        return {
            action: USER_ACTIONS.PLAY_CARDS,
            data: {
                cardIndexes: cards.map(({index}) => index),
            }
        };
    }

    private async selectExchange() {
        const card1Index = await this.input.getExchangeForPosition(this.name, 0);
        const card2Index = await this.input.getExchangeForPosition(this.name, 1);
        const card3Index = await this.input.getExchangeForPosition(this.name, 2);

        return [
            card1Index,
            card2Index,
            card3Index,
        ]
    }

    async play(round: number, table: VisibleTable, otherPlayers: VisiblePlayers, cardRules: CardRules, drawPileCards: number): Promise<PlayerAction> {
        if (round === 0) {
            return {
                action: USER_ACTIONS.EXCHANGE,
                data: {
                    exchange: await this.selectExchange(),
                },
            };
        }
        const shouldSelectByIndex = !this.getActiveHand().visible;
        while (true) {
            // loop until one action has been taken
            let order;
            while (!order) {
                order = await this.input.getOrder(this.name, shouldSelectByIndex);
            }

            switch (order) {
                case USER_ACTIONS.WHAT_TO_PLAY:
                case USER_ACTIONS.GET_ALL:
                    return {
                        action: order,
                    };
                case USER_ACTIONS.SORT_HAND:
                    this.getPlayerHand().sort();
                    return {
                        action: order,
                    };
                default:
                    const { action, data } = await this.selectCards(order, shouldSelectByIndex);
                    if (action !== "Error") {
                        return {
                            action,
                            data,
                        }
                    }
            }
        }
    }
}

export default HumanPlayer;

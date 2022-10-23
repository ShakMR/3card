import Player, { PlayerAction } from "../Player";
import { USER_ACTIONS } from "../../user_input/UserInput";
import Hand from "../../hand/Hand";
import PlayerHand from "../../hand/PlayerHand";
import Card from "../../card/Card";
import DefenseHand from "../../hand/DefenseHand";
import secretHand from "../../hand/SecretHand";
import SecretHand from "../../hand/SecretHand";

class TestPlayer extends Player {
    constructor(public name: string, private playResult: any) {
        super({name});
    }

    async play(): Promise<PlayerAction> {
        return this.playResult as PlayerAction
    }
}

class TestCard extends Card {
    get suitSymbol(): string {
        return "";
    }

    get symbol(): string | number {
        return 0;
    }
}

const addCardsToHand = (hand: Hand, howMany: number, suit: string) => {
    for (let i = 0; i < howMany; i++) {
        hand.addCard(new TestCard(i, suit));
    }
    return hand;
}


describe("Player", () => {
    it ("Can create player", () => {
        const player = new TestPlayer("test", {});
        expect(player.name).toBe("test");
    });

    it("Can set hands", () => {
        const phand = addCardsToHand(new PlayerHand(), 3, 'p');
        const dhand = addCardsToHand(new DefenseHand(), 3, 'd');
        const shand = addCardsToHand(new secretHand(), 3, 's');
        const player = new TestPlayer("hand", {});
        expect(player.getAllHands()).toHaveLength(3)
        expect(player.getAllHands()).toEqual([null, null, null])
        player.setHand(2, shand)
        expect(player.getActiveHand()).toBeInstanceOf(SecretHand);
        player.setHand(1, dhand)
        expect(player.getActiveHand()).toBeInstanceOf(DefenseHand);
        player.setHand(0, phand)
        expect(player.getActiveHand()).toBeInstanceOf(PlayerHand);
    })

    describe("Can get cards", () => {
        let player: Player;

        beforeEach(() => {
            const phand = addCardsToHand(new PlayerHand(), 3, 'p');
            const dhand = addCardsToHand(new DefenseHand(), 3, 'd');
            const shand = addCardsToHand(new secretHand(), 3, 's');
            player = new TestPlayer("hand", {});

            player.setHand(2, shand)
            player.setHand(1, dhand)
            player.setHand(0, phand)
        })

        it("from player hand when having cards there", () => {
            const cards = player.getCards({ cardIndexes: [0,1,2]});

            expect(cards).toHaveLength(3);
            expect(cards.map((c) => c.suit)).toEqual(['p','p','p'])
        });

        it("from defense hand when no cards in player hand", () => {
            player.setHand(0, new PlayerHand());
            const cards = player.getCards({ cardIndexes: [0,1,2]});

            expect(cards).toHaveLength(3);
            expect(cards.map((c) => c.suit)).toEqual(['d','d','d'])
        });

        it("from secret when no card in defense or player hand", () => {
            player.setHand(1, new DefenseHand());
            const cards = player.getCards({ cardIndexes: [0,1,2]});

            expect(cards).toHaveLength(3);
            expect(cards.map((c) => c.suit)).toEqual(['s','s','s'])
        });

        it("when not having card in secret", () => {
            player.setHand(2, new SecretHand());
            const cards = player.getCards({ cardIndexes: [0,1,2]});

            expect(cards).toHaveLength(3);
        });
    })
})

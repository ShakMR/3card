import Player, { PlayerAction } from "./Player";
import { VisibleTable } from "../table/visibleTable";
import { VisiblePlayers } from "./visiblePlayers";
import { CardRules } from "../game_rules/trix";

class RandomComputerPlayer extends Player {
    async play(table: VisibleTable, otherPlayers: VisiblePlayers, cardRules: CardRules, drawPileCards: number): Promise<PlayerAction> {
        
    }
}

export default RandomComputerPlayer;

import Card from "../card/Card";
import Player from "./Player";
import HANDS_CONFIG from "../hand/config";

export enum PlayerPosition {
  left = "left",
  front = "front",
  right = "right",
}

export interface VisiblePlayers {
  seeCards: (position: PlayerPosition) => Card[] | undefined;
  seeNumberOfCards: (position: PlayerPosition) => number | undefined;
}

export default (playerList: Player[], currentTurn: number) => {
  const nPlayers = playerList.length;
  const players = {
    [PlayerPosition.left]: playerList[(currentTurn + 1) % nPlayers],
    [PlayerPosition.front]: playerList[(currentTurn + 2) % nPlayers],
    [PlayerPosition.right]: playerList[(currentTurn + 3) % nPlayers],
  };
  const visiblePlayer: VisiblePlayers = {
    seeCards: (position: PlayerPosition): Card[] | undefined => {
      return players[position]?.getHand(HANDS_CONFIG.DEFENSE.priority)
        ?.cards as Card[];
    },
    seeNumberOfCards: (position: PlayerPosition): number | undefined => {
      return players[position]?.getActiveHand().cards.length;
    },
  };

  return visiblePlayer;
};

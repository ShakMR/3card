import { Status } from "../../../../IO/display/Display";
import { cardLine, handCardsHorizontal, tableTopCardSuit, tableTopCardSymbol } from "./cardDrawing";
import { TypeOfPlayer } from "../../domain/player/Player";

export function twoPlayerTable(
  { table, players, turn, deck, hidden = false }: Status,
  showBotsHand: boolean
): void {
  const topCard = table.topCard();
  const playingNow = players[turn];
  const contrary = players[(turn + 1) % players.length];
  const hands = playingNow.getAllHands();
  const contraryHands = contrary.getAllHands();

  const deckString =
    deck.cards.length >= 10 ? `${deck.cards.length}` : `0${deck.cards.length}`;

  let shouldShowHand = !hidden;

  if (playingNow.typeOfPlayer === TypeOfPlayer.Bot) {
    shouldShowHand = shouldShowHand && showBotsHand;
  }

  console.log(`
${handCardsHorizontal({ hands: contraryHands, reverse: true }).join("")}
${contrary.name}


  ${cardLine({})}    ${cardLine({})}
  ${cardLine({})}    ${tableTopCardSymbol(topCard)}
  ${cardLine({ symbol: deckString, side: "middle" })}    ${cardLine({})}
  ${cardLine({})}    ${tableTopCardSuit(topCard)}
  ${cardLine({})}    ${cardLine({})}

${playingNow.name}
${handCardsHorizontal({
  hands,
  reverse: false,
  showPlayerHand: shouldShowHand,
}).join("")}
`);
}
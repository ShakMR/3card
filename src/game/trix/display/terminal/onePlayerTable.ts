import { Status } from "../../../../IO/display/Display";
import { cardLine, handCardsHorizontal, tableTopCardSuit, tableTopCardSymbol } from "./cardDrawing";

export function onePlayerTable({ table, players, turn, deck }: Status): void {
  const topCard = table.topCard();
  const hands = players[turn].getAllHands();

  const deckString =
    deck.cards.length >= 10 ? `${deck.cards.length}` : `0${deck.cards.length}`;

  const handsDisplay = handCardsHorizontal({
    hands,
    reverse: false,
    showPlayerHand: true,
  });
  console.log(`
  ${cardLine({})}    ${cardLine({})}
  ${cardLine({})}    ${tableTopCardSymbol(topCard)}
  ${cardLine({ symbol: deckString, side: "middle" })}    ${cardLine({})}
  ${cardLine({})}    ${tableTopCardSuit(topCard)}
  ${cardLine({})}    ${cardLine({})}

${handsDisplay.join("")}
`);
}
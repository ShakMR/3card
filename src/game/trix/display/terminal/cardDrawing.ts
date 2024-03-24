import Card from "../../../../domain/card/Card";
import { BGColor, FontColor } from "./colors";
import { Styles } from "./styles";
import type { IHand } from "../../domain/hand";

export const tableTopCardSymbol = (card: Card) => {
  return card
    ? cardSymbolLine({ card, visible: true })
    : cardLine({ side: "left" });
};

export const tableTopCardSuit = (card: Card) => {
  return cardLine({ symbol: card && card.suitSymbol, side: "right" });
};

export const handCardsHorizontal = ({
  hands,
  reverse = false,
  showPlayerHand = false,
}: {
  hands: Array<IHand | null>;
  reverse?: boolean;
  showPlayerHand?: boolean;
}) => {

  const display = hands
    .filter((hand: IHand | null) => hand)
    .map((hand: IHand | null, index: number) => {
      if (!hand) return;
      const shouldCardBeVisible =
        hand.visible && (index !== 0 || showPlayerHand);
      const handsSymbols = hand.cards
        .map((c) => cardSymbolLine({ card: c, visible: shouldCardBeVisible }))
        .join("  ");
      const handsSuits = hand.cards
        .map((c) => cardSuitsLine({ card: c, visible: shouldCardBeVisible }))
        .join("  ");
      const topSymbols = !reverse ? handsSymbols : handsSuits;
      const bottomSymbols = !reverse ? handsSuits : handsSymbols;
      const numberHeader = range(0, hand.cards.length)
        .map((i) => `${i < 10 ? `${i} ` : i}    `)
        .join("  ");
      const header = range(0, hand.cards.length)
        .map(() => cardLine({}))
        .join("  ");
      const center = range(0, hand.cards.length)
        .map(() => cardLine({}))
        .join("  ");
      return `
${numberHeader}
${header}
${topSymbols}
${center}
${bottomSymbols}
${header}`;
    });

  return reverse ? display.reverse() : display;
};

type CardLineParams = {
  symbol?: string;
  side?: "left" | "right" | "middle";
  color?: FontColor;
};

export const cardLine = ({
  symbol,
  side = "left",
  color = FontColor.black,
}: CardLineParams) => {
  const leftSymbol =
    symbol && side === "left"
      ? symbol
      : !symbol || side === "right"
      ? "  "
      : " ";
  const rightSymbol = symbol && side === "right" ? symbol : " ";
  const middleSymbol = symbol && side === "middle" ? symbol : " ";

  return `${BGColor.white}${color} ${leftSymbol}${middleSymbol}${rightSymbol} ${Styles.reset}`;
};

type CardLine = {
  card: Card | null;
  visible: boolean;
};

export const cardSymbolLine = ({ card, visible = true }: CardLine) => {
  const symbol = card?.number !== 10 ? `${card?.symbol} ` : `${card.symbol}`;
  return cardLine({ symbol: visible ? symbol : undefined, side: "left" });
};

export const cardSuitsLine = ({ card, visible }: CardLine) => {
  let color = FontColor.red;
  if (card && ["S", "C"].includes(card.suit)) {
    color = FontColor.black;
  }
  return cardLine({
    symbol: visible ? card?.suitSymbol : undefined,
    side: "right",
    color,
  });
};

export const range = (i: number, j: number): number[] => {
  const r = [];
  for (i; i < j; i++) {
    r.push(i);
  }
  return r;
};
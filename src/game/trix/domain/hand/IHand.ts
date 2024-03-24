import type { ICard } from "../../../../domain/card/Card";

export interface IHand {
  playCard(indexes: number[]): ICard[];
  getPriority(): number;
  isLimitReached(): boolean;
  cards: ICard[] | null[];
  getCard(index: number): ICard | null;
  addCard(card: ICard): number;
  replaceCard(card: ICard, index: number): void;
  isEmpty(): boolean;
  visible: boolean;
}
import type Table from "./Table";
import { type ICard } from "../card/Card";

export interface VisibleTable {
  topCard: () => ICard;
}

export default (table: Table): VisibleTable => ({
  topCard: () => table.topCard(),
});

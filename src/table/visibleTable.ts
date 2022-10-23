import Table from "./Table";
import Card from "../card/Card";

export interface VisibleTable {
    topCard: () => Card;
}

export default (table: Table): VisibleTable => ({
    topCard: () => table.topCard(),
})

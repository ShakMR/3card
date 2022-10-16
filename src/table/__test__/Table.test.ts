import Table from "../Table";
import { resolutions } from "../../resolutions";
import PokerCard, { Suit } from "../../card/PokerCard";

describe('Table', () => {
  let table: Table;

  beforeEach(() => {
    table = new Table();
  })

  it('Should instantiate classe', () => {

    expect(table).toBeInstanceOf(Table);
  });

  test.each([[1], [2], [3], [4], [5], [6], [7], [8], [9], [11], [12], [13]])
  ('should add a %d card and resolve when empty', (number) => {

    const card = new PokerCard(number, Suit.C);
    const resolution = table.playCard([card]);

    expect(resolution).toBe(resolutions.NEXT);
  });

  test.each([
    [1, resolutions.JUMP],
    [2, resolutions.NEXT],
    [3, resolutions.NEXT],
    [4, resolutions.NOPE],
    [5, resolutions.NOPE],
    [6, resolutions.NOPE],
    [7, resolutions.NOPE],
    [8, resolutions.NOPE],
    [9, resolutions.NOPE],
    [10, resolutions.SAME],
    [11, resolutions.NOPE],
    [12, resolutions.NOPE],
    [13, resolutions.NOPE]
  ])('should allow to play %d on top of 1? %s', (number, expected) => {

    const previousCard = new PokerCard(1, Suit.H);
    expect(table.playCard([previousCard])).toBe(resolutions.NEXT);

    const card = new PokerCard(number, Suit.S);
    const resolution = table.playCard([card]);

    expect(resolution).toBe(expected);
  })

  it('should discard cards when there are four of the same in the stack', () => {

    for (let n of [1,1,1]) {
      table.playCard([new PokerCard(n, Suit.S)]);
    }

    const resolution = table.playCard([new PokerCard(1, Suit.H)]);

    expect(resolution).toBe(resolutions.SAME);
    expect(table.discardStack).toHaveLength(4);
    expect(table.gameStack).toHaveLength(0);
  })

  it('should add cards to discard stack', () => {
    table.discardCards([new PokerCard(1, Suit.S)]);

    expect(table.discardStack).toHaveLength(1);
  })
});

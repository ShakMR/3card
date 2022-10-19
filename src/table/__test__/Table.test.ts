import Table from "../Table";
import { Resolutions } from "../../resolutions";
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

    expect(resolution).toBe(Resolutions.NEXT);
  });

  test.each([
    [1, Resolutions.JUMP],
    [2, Resolutions.NEXT],
    [3, Resolutions.NEXT],
    [4, Resolutions.NOPE],
    [5, Resolutions.NOPE],
    [6, Resolutions.NOPE],
    [7, Resolutions.NOPE],
    [8, Resolutions.NOPE],
    [9, Resolutions.NOPE],
    [10, Resolutions.SAME],
    [11, Resolutions.NOPE],
    [12, Resolutions.NOPE],
    [13, Resolutions.NOPE]
  ])('should allow to play %d on top of 1? %s', (number, expected) => {

    const previousCard = new PokerCard(1, Suit.H);
    expect(table.playCard([previousCard])).toBe(Resolutions.NEXT);

    const card = new PokerCard(number, Suit.S);
    const resolution = table.playCard([card]);

    expect(resolution).toBe(expected);
  })

  it('should discard cards when there are four of the same in the stack', () => {

    for (let n of [1,1,1]) {
      table.playCard([new PokerCard(n, Suit.S)]);
    }

    const resolution = table.playCard([new PokerCard(1, Suit.H)]);

    expect(resolution).toBe(Resolutions.SAME);
    expect(table.discardStack).toHaveLength(4);
    expect(table.gameStack).toHaveLength(0);
  })

  it('should add cards to discard stack', () => {
    table.discardCards([new PokerCard(1, Suit.S)]);

    expect(table.discardStack).toHaveLength(1);
  })
});

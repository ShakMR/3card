const Table = require('../Table');
const Card = require("../../card/Card");
const RESOLUTIONS = require("../../resolutions");

describe('Table', () => {
  /** @type Table */
  let table;
  beforeEach(() => {
    table = new Table();
  })

  it('Should instantiate classe', () => {

    expect(table).toBeInstanceOf(Table);
  });

  test.each([[1], [2], [3], [4], [5], [6], [7], [8], [9], [11], [12], [13]])
  ('should add a %d card and resolve when empty', (number) => {

    const card = new Card(number, 'S');
    const resolution = table.playCard([card]);

    expect(resolution).toBe(RESOLUTIONS.NEXT);
  });

  test.each([
    [1, RESOLUTIONS.JUMP],
    [2, RESOLUTIONS.NEXT],
    [3, RESOLUTIONS.NEXT],
    [4, RESOLUTIONS.NOPE],
    [5, RESOLUTIONS.NOPE],
    [6, RESOLUTIONS.NOPE],
    [7, RESOLUTIONS.NOPE],
    [8, RESOLUTIONS.NOPE],
    [9, RESOLUTIONS.NOPE],
    [10, RESOLUTIONS.SAME],
    [11, RESOLUTIONS.NOPE],
    [12, RESOLUTIONS.NOPE],
    [13, RESOLUTIONS.NOPE]
  ])('should allow to play %d on top of 1? %s', (number, expected) => {

    const previousCard = new Card(1, 'H');
    expect(table.playCard([previousCard])).toBe(RESOLUTIONS.NEXT);

    const card = new Card(number, 'S');
    const resolution = table.playCard([card]);

    expect(resolution).toBe(expected);
  })

  it('should discard cards when there are four of the same in the stack', () => {

    for (let n of [1,1,1]) {
      table.playCard([new Card(n, 'S')]);
    }

    const resolution = table.playCard([new Card(1, 'H')]);

    expect(resolution).toBe(RESOLUTIONS.SAME);
    expect(table.discardStack).toHaveLength(4);
    expect(table.gameStack).toHaveLength(0);
  })

  it('should add cards to discard stack', () => {
    table.discardCards([new Card(1, 's')]);

    expect(table.discardStack).toHaveLength(1);
  })
});

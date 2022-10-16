// X is the key Y the value, play value after a key has been played
export const afterXCanPlayAnyOf: Record<number, number[]> = {
  1: [1, 2, 3, 10],
  3: [3],
  7: [2, 10, 3, 4, 5, 6, 7],
}

afterXCanPlayAnyOf["13"] = [...afterXCanPlayAnyOf["1"], 13];
afterXCanPlayAnyOf["12"] = [...afterXCanPlayAnyOf["13"], 12];
afterXCanPlayAnyOf["11"] = [...afterXCanPlayAnyOf["12"], 11];
afterXCanPlayAnyOf["10"] = [...afterXCanPlayAnyOf["11"], 10];
afterXCanPlayAnyOf["9"] = [...afterXCanPlayAnyOf["10"], 9];
afterXCanPlayAnyOf["8"] = [...afterXCanPlayAnyOf["9"], 8];
afterXCanPlayAnyOf["6"] = [...afterXCanPlayAnyOf["8"], 7, 6];
afterXCanPlayAnyOf["5"] = [...afterXCanPlayAnyOf["6"], 5];
afterXCanPlayAnyOf["4"] = [...afterXCanPlayAnyOf["5"], 4];
afterXCanPlayAnyOf["2"] = [...afterXCanPlayAnyOf["4"]];

// X is the key Y the value, play key after a value has been played.
export const canPlayXAfterAnyOfY: Record<number, number[]> = {
  4: [2, 4, 7],
  8: [2, 4, 5, 6, 8],
  3: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
}

canPlayXAfterAnyOfY["5"] = [...canPlayXAfterAnyOfY["4"], 5];
canPlayXAfterAnyOfY["6"] = [...canPlayXAfterAnyOfY["5"], 6];
canPlayXAfterAnyOfY["7"] = [...canPlayXAfterAnyOfY["6"], 7];
canPlayXAfterAnyOfY["9"] = [...canPlayXAfterAnyOfY["8"], 9];
canPlayXAfterAnyOfY["11"] = [...canPlayXAfterAnyOfY["9"], 11];
canPlayXAfterAnyOfY["12"] = [...canPlayXAfterAnyOfY["11"], 12];
canPlayXAfterAnyOfY["13"] = [...canPlayXAfterAnyOfY["12"], 13];
canPlayXAfterAnyOfY["1"] = [...canPlayXAfterAnyOfY["13"], 1];
canPlayXAfterAnyOfY["10"] = [...canPlayXAfterAnyOfY["1"], 7];
canPlayXAfterAnyOfY["2"] = [...canPlayXAfterAnyOfY["1"], 7];

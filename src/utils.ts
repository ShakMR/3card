import readline from 'readline'

const terminal = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askUser = async (question: string) => new Promise<string>((resolve) => {
  terminal.question(question, (txt) => {
    resolve(txt.trimRight())
  });
})

const askUserForNumber = async (question: string, rangeStart?: number, rangeEnds?: number) => {
  const q = rangeStart || rangeStart === 0 ? `${question} [${rangeStart} - ${rangeEnds}]` : question;
  let answer = parseInt(await askUser(q), 10);
  while (isNaN(answer) || (rangeStart && answer < rangeStart) || (rangeEnds && answer > rangeEnds)) {
    answer = parseInt(await askUser(q), 10);
  }
  return answer;
}

export default {
  askUser,
  askUserForNumber
}
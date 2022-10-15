const readline = require('readline');

const terminal = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askUser = async (question) => new Promise((resolve) => {
  terminal.question(question, (txt) => {
    resolve(txt.trimRight())
  });
})

const askUserForNumber = async (question, rangeStart = null, rangeEnds = null) => {
  const q = rangeStart || rangeStart === 0 ? `${question} [${rangeStart} - ${rangeEnds}]` : question;
  let answer = parseInt(await askUser(q), 10);
  while (isNaN(answer) || (rangeStart && answer < rangeStart) || (rangeEnds && answer > rangeEnds)) {
    answer = parseInt(await askUser(q), 10);
  }
  return answer;
}

module.exports = {
  askUser,
  askUserForNumber
}

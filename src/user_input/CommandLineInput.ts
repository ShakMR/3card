import UserInput, { type RangeQuestionOptions } from "./UserInput";
import readline, { Interface } from "readline";

const infinitySymbol = '\u221E';

class CommandLineInput implements UserInput {
  private terminal: Interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  askUser(question: string): Promise<string> {
    return new Promise<string>((resolve) => {
      this.terminal.question(question, (txt) => {
        resolve(txt.trimEnd());
      });
    });
  }

  private formatQuestion(question: string, { rangeStart, rangeEnd, optional, showRange }: RangeQuestionOptions) {
    let q = question;

    if (showRange && (rangeStart || rangeStart === 0)) {
      const rangeEndsChar = rangeEnd || infinitySymbol;
      q += ` [${rangeStart} - ${rangeEndsChar}]`;
    }

    if (optional) {
      q += " (optional)";
    }

    return q;
  }

  private isValidNumber(answer: number, { rangeStart, rangeEnd, optional }: RangeQuestionOptions) {
    if (optional && isNaN(answer)) {
      return true;
    }

    if (isNaN(answer)) {
      return false;
    }

    if (rangeStart && answer < rangeStart) {
      return false;
    }

    return !(rangeEnd && answer > rangeEnd);
  }

  async askUserForNumber(
    question: string,
    options: RangeQuestionOptions
  ): Promise<number> {

    const q = this.formatQuestion(question, options);

    let answer = parseInt(await this.askUser(q), 10);

    while (!this.isValidNumber(answer, options)) {
      answer = parseInt(await this.askUser(q), 10);
    }

    return answer;
  }

  private formatOptionsQuestion(question: string, options: string[], customQuestion: string) {
    let q = question;
    if (customQuestion) {
      q = customQuestion;
    }
    q += "\n";
    options.forEach((option, index) => {
      q += `${index + 1}. ${option}\n`;
    });
    return q;
  }

  async askForOptions(options: string[], customQuestion: string): Promise<string> {
    const question = this.formatOptionsQuestion('Choose one of the following options:', options, customQuestion);
    const answer = await this.askUserForNumber(question, { rangeStart: 1, rangeEnd: options.length, showRange: false });
    return options[answer - 1];
  }
}

export default CommandLineInput;

export type RangeQuestionOptions = {
  rangeStart?: number;
  rangeEnd?: number;
  optional?: boolean;
  showRange?: boolean;
};

interface UserInput {
  askUser(question: string): Promise<string>;

  askUserForNumber(
    question: string,
    options: RangeQuestionOptions
  ): Promise<number>;

  askForOptions(options: string[], customQuestion?: string): Promise<string>;
}

export default UserInput;

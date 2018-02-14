export class RandomHelper {
  public static getRandomInt(minValue: number, maxValue: number) {
    return Math.round(Math.random() * (maxValue - minValue) + minValue);
  }

  public static getRandomObjectId(length = 10): string {
    const symbols = "0123456789abcdef";
    let result = "";
    for (let i = 0; i < length; ++i) {
      result += symbols[RandomHelper.getRandomInt(0, symbols.length - 1)];
    }
    return result;
  }

  public static getRandomWord(wordMinLength: number = 6, wordMaxLength?: number): string {
    wordMaxLength = wordMaxLength || wordMinLength;
    const vows = "awoeuyijo";
    const cons = "qrtpsdfghklzxcvbnm";
    const symbolsCount = RandomHelper.getRandomInt(wordMinLength, wordMaxLength);
    let result = "";
    const firstVowOrCon = RandomHelper.getRandomInt(0, 1);
    for (let i = 0; i < symbolsCount; ++i) {
      result +=
        i % 2 == firstVowOrCon
          ? vows[RandomHelper.getRandomInt(0, vows.length - 1)]
          : cons[RandomHelper.getRandomInt(0, cons.length - 1)];
    }
    return result;
  }

  public static getRandomPhrase(phraseMinLength: number = 3, phraseMaxLength?: number): string {
    phraseMaxLength = phraseMaxLength || phraseMinLength;
    const words: string[] = [];
    const phraseLength = RandomHelper.getRandomInt(phraseMinLength, phraseMaxLength);
    for (let i = 0; i < phraseLength; ++i) {
      words.push(RandomHelper.getRandomWord(4, 7));
    }
    return words.join(" ");
  }
}

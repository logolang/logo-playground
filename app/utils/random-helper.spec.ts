import { RandomHelper } from "./random-helper";

describe("RandomHelper", () => {
  it("should generate int 0 or 1 with approx 50% probability", () => {
    const results: number[] = [];
    for (let i = 0; i < 1000; ++i) {
      results.push(RandomHelper.getRandomInt(0, 1));
    }

    let zerosCount = 0;
    let onesCount = 0;
    results.forEach(v => {
      switch (v) {
        case 0:
          zerosCount++;
          break;
        case 1:
          onesCount++;
          break;
        default:
          throw new Error(`not expected value ${v}`);
      }
    });

    chai.expect(onesCount + zerosCount).to.be.eql(1000);
    chai.expect(Math.abs(onesCount - zerosCount)).to.be.lessThan(120);
  });

  it("should generate random word", () => {
    for (let i = 0; i < 100; ++i) {
      const generated = RandomHelper.getRandomWord(3, 6);
      chai.expect(generated).to.be.a("string");
      chai.expect(generated.length).to.be.lessThan(7);
      chai.expect(generated.length).to.be.greaterThan(2);
    }
  });

  it("should generate random phrase", () => {
    for (let i = 0; i < 100; ++i) {
      const generated = RandomHelper.getRandomPhrase(3, 6);
      chai.expect(generated).to.be.a("string");
      const parts = generated.split(" ");
      chai.expect(parts).to.be.a("array");
      chai.expect(parts.length).to.be.lessThan(7);
      chai.expect(parts.length).to.be.greaterThan(2);
    }
  });
});

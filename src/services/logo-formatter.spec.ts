import * as chai from "chai";
import { formatLogoProgram } from "./logo-formatter";

describe("Logo formatter", () => {
  it("adds single indentation properly for command lists", async () => {
    const input = `
repeat 100 [
fd 10
]
`;

    const expected = `
repeat 100 [
  fd 10
]
`;

    chai.expect(formatLogoProgram(input)).to.be.eql(expected.trimLeft());
  });

  it("adds single indentation properly for function", async () => {
    const input = `
to line1
fd 100
end
`;

    const expected = `
to line1
  fd 100
end
`;

    chai.expect(formatLogoProgram(input)).to.be.eql(expected.trimLeft());
  });

  it("adds single indentation properly for function", async () => {
    const input = `
to curve
repeat 10 [
fd 10
rt 1
]
end
`;

    const expected = `
to curve
  repeat 10 [
    fd 10
    rt 1
  ]
end
`;

    chai.expect(formatLogoProgram(input)).to.be.eql(expected.trimLeft());
  });

  it("adds spaces around special symbols", async () => {
    const input = `3*6/3*pick[1 2 3]`;

    const expected = `3 * 6 / 3 * pick [ 1 2 3 ]`;

    chai.expect(formatLogoProgram(input)).to.be.eql(expected.trimLeft());
  });

  it("removes extra spaces from code", async () => {
    const input = `  to  circle   arc  360  100 end   `;

    const expected = `to circle arc 360 100 end`;

    chai.expect(formatLogoProgram(input)).to.be.eql(expected.trimLeft());
  });
});

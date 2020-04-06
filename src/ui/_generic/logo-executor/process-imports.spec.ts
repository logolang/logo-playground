import * as chai from "chai";
import { processImports } from "./process-imports";

const mSingleImport = `
import "m_sub1
m_sub1 1000
`;

const mRecurseImport = `
import "m_single_import
m_sub1 2000
`;

const sub1 = `
to m_sub1
  print "hi
end
m_sub1 3000
`;

const defs: { [key: string]: string } = {
  ["m_single_import"]: mSingleImport,
  ["m_sub1"]: sub1,
  ["m_recurse_import"]: mRecurseImport
};

async function resolver(moduleName: string): Promise<string> {
  return defs[moduleName];
}

describe("process-imports", () => {
  it("should add single import correctly", async () => {
    const actual = await processImports(mSingleImport, resolver);
    const expected = `
to m_sub1
  print "hi
end
m_sub1 1000
`.trim();
    chai.expect(actual).to.be.eql(expected);
  });

  it("should add imports recursively", async () => {
    const actual = await processImports(mRecurseImport, resolver);
    const expected = `
to m_sub1
  print "hi
end
m_sub1 2000
`.trim();
    chai.expect(actual).to.be.eql(expected);
  });
});

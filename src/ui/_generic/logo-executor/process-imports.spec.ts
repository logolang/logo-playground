import * as chai from "chai";
import { processImports } from "./process-imports";

const m_single_import = `
import "m_sub1
m_sub1 1000
`;

const m_recurse_import = `
import "m_single_import
m_sub1 2000
`;

const m_sub1 = `
to m_sub1
  print "hi
end
m_sub1 3000
`;

async function resolver(moduleName: string): Promise<string> {
  const defs = {
    m_single_import,
    m_sub1,
    m_recurse_import
  };
  return (defs as any)[moduleName] as any;
}

describe("process-imports", () => {
  it("should add single import correctly", async () => {
    const actual = await processImports(m_single_import, resolver);
    const expected = `
to m_sub1
  print "hi
end
m_sub1 1000
`.trim();
    chai.expect(actual).to.be.eql(expected);
  });

  it("should add imports recursively", async () => {
    const actual = await processImports(m_recurse_import, resolver);
    const expected = `
to m_sub1
  print "hi
end
m_sub1 2000
`.trim();
    chai.expect(actual).to.be.eql(expected);
  });
});

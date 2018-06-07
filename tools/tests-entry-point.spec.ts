import * as chai from "chai";
chai.should();

(window as any).chai = chai;

import * as Enzyme from "enzyme";
import * as EnzymeAdapter from "enzyme-adapter-react-16";

Enzyme.configure({ adapter: new EnzymeAdapter() });

describe("Logo playground tests", () => {
  it("Must be green", () => {
    /* This test is just to be executed first and green to ensure that we have tests environment well configured */
  });
});

/**
 * Include all spec files
 */
const req = (require as any).context("app/", true, /\.spec.tsx?$/);
req.keys().forEach(req);

import * as chai from "chai";
import { TutorialsService, TutorialStepContent } from "./tutorials-service";

const testStep1 = `
# Step 1
`;

const testStep2 = `
# Step 2
<!--solution-->

\`\`\`
forward 100
right 90
\`\`\`
`;

const testStep3 = `
# Step 3
![Some image](./image.svg)
`;

describe("Tutorials service", () => {
  async function getResult(testMarkdown: string): Promise<TutorialStepContent> {
    const service = new TutorialsService({
      getFileContent: async () => testMarkdown,
      resolveRelativeUrl: x => "content/" + x
    });
    return service.getStep("tutorialId", "stepId");
  }

  it("transforms markdown to html", async () => {
    const result = await getResult(testStep1);
    const expectedMarkup = "<h1>Step 1</h1>";
    chai.expect(result.content).to.be.eql(expectedMarkup);
  });

  it("extracts solution code from markdown", async () => {
    const result = await getResult(testStep2);
    const expectedMarkup = "<h1>Step 2</h1>";
    const expectedCode = `forward 100
right 90`;
    chai.expect(result.content).to.be.eql(expectedMarkup);
    chai.expect(result.solutionCode).to.be.eql(expectedCode);
  });

  it("updates relative image url", async () => {
    const result = await getResult(testStep3);
    const expectedMarkup = `<h1>Step 3</h1>
<p><img src="content/tutorials/tutorialId/image.svg" alt="Some image"></p>`;
    chai.expect(result.content).to.be.eql(expectedMarkup);
  });
});

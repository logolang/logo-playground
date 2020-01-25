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

const testStep4_Solution_And_Embedded = `
# Step 4
<!--solution-->
\`\`\`
forward 100
\`\`\`

Example 1:

<!--logo {"width":"200px","height":"150px"}-->
\`\`\`
arc 360 100 
\`\`\`

Example 2:

<!--logo {"width":"200px","height":"50px"}-->
\`\`\`
arc 360 25 
\`\`\`
`;

describe("Tutorials service", () => {
  async function getResult(testMarkdown: string): Promise<TutorialStepContent> {
    const service = new TutorialsService({
      loadFile: async () => testMarkdown,
      getCurrentLocaleId: () => "en"
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

  it("extracts solution code and logo inlined from markdown", async () => {
    const result = await getResult(testStep4_Solution_And_Embedded);

    const expectedCode = `forward 100`;
    chai.expect(result.solutionCode).to.be.eql(expectedCode);
    const expectedInlines = {
      logo1: {
        code: "arc 360 100",
        params: { width: "200px", height: "150px" }
      },
      logo2: {
        code: "arc 360 25",
        params: { width: "200px", height: "50px" }
      }
    };
    chai.expect(result.inlinedCode).to.eql(expectedInlines);

    const expectedMarkup = `<h1>Step 4</h1>
<p>Example 1:</p>
<div id="logo1" class="logo-inline-container" style="width:200px;height:150px"></div>
<p>Example 2:</p>
<div id="logo2" class="logo-inline-container" style="width:200px;height:50px"></div>`;

    chai.expect(result.content).to.eql(expectedMarkup);
  });
});

import * as markdown from "markdown-it";
import { ILocalizedContentLoader } from "app/services/infrastructure/localized-content-loader";
import { injectable, inject } from "app/di";

export interface ITutorialInfo {
  id: string;
  label: string;
  steps: number;
  description: string;
}

export interface ITutorialStep {
  name: string;
  index: number;
  content: string;
  initialCode: string;
  resultCode: string;
}

/**
 * Gets access to tutorials content
 */
export abstract class ITutorialsContentService {
  abstract getTutorialsList(): Promise<ITutorialInfo[]>;
  abstract getSteps(tutorialId: string): Promise<ITutorialStep[]>;
}

@injectable()
export class TutorialsContentService implements ITutorialsContentService {
  private tutorialInfos: ITutorialInfo[] = [];

  constructor(@inject(ILocalizedContentLoader) private contentLoader: ILocalizedContentLoader) {}

  private getIdFromIndex(index: number): string {
    const id = (index + 1).toString();
    return id.length > 1 ? id : "0" + id;
  }

  async getTutorialsList(): Promise<ITutorialInfo[]> {
    if (this.tutorialInfos.length == 0) {
      try {
        const result = await this.contentLoader.getFileContent("tutorials/index.json");
        const data = JSON.parse(result);
        this.tutorialInfos = data.tutorials;
      } catch (ex) {
        throw ex;
      }
    }
    return this.tutorialInfos;
  }

  async getSteps(tutorialId: string): Promise<ITutorialStep[]> {
    const tutorial = this.tutorialInfos.find(t => t.id === tutorialId);
    if (!tutorial) {
      return [];
    }
    const stepContentPromises: Promise<string>[] = [];
    for (let stepIndex = 0; stepIndex < tutorial.steps; ++stepIndex) {
      stepContentPromises.push(
        this.contentLoader.getFileContent(`tutorials/${tutorialId}/step-${this.getIdFromIndex(stepIndex)}.md`)
      );
    }
    const md = new markdown({
      html: true // Enable HTML tags in source;
    });
    const allStepsContent = await Promise.all(stepContentPromises);
    const steps = allStepsContent.map((stepContent, index) => {
      const resultCodeRegex = /```result[\s\S]*```/g;
      let matches = stepContent.match(resultCodeRegex);
      let resultCode = "";
      if (matches && matches.length > 0) {
        resultCode = matches[0].replace(/```result|```/g, "").trim() + "\r\n";
        stepContent = stepContent.replace(resultCodeRegex, "");
      }

      const initCodeRegex = /```init[\s\S]*```/g;
      matches = stepContent.match(resultCodeRegex);
      let initCode = "";
      if (matches && matches.length > 0) {
        initCode = matches[0].replace(/```init|```/g, "");
        stepContent = stepContent.replace(initCodeRegex, "");
      }

      const tutorialStep: ITutorialStep = {
        name: "Step " + (index + 1),
        content: md.render(stepContent),
        initialCode: initCode,
        resultCode: resultCode,
        index: index
      };
      return tutorialStep;
    });
    return steps;
  }
}

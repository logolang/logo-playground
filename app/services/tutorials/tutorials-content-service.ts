import * as markdown from "markdown-it";
import { ILocalizedContentLoader } from "app/services/infrastructure/localized-content-loader";
import { injectable, inject } from "app/di";

export interface ITutorialInfo {
  id: string;
  label: string;
  steps: ITutorialStepInfo[];
  description: string;
  level: string;
}

export interface ITutorialStepInfo {
  id: string;
  name: string;
}

export interface ITutorialStepContent {
  content: string;
  initialCode: string;
  resultCode: string;
}

/**
 * Gets access to tutorials content
 */
export abstract class ITutorialsContentService {
  abstract getTutorialsList(): Promise<ITutorialInfo[]>;
  abstract getStep(tutorialId: string, stepId: string): Promise<ITutorialStepContent>;
}

@injectable()
export class TutorialsContentService implements ITutorialsContentService {
  private tutorialInfos: ITutorialInfo[] = [];

  constructor(@inject(ILocalizedContentLoader) private contentLoader: ILocalizedContentLoader) {}

  async getTutorialsList(): Promise<ITutorialInfo[]> {
    if (this.tutorialInfos.length == 0) {
      const result = await this.contentLoader.getFileContent("tutorials/index.json");
      const data = JSON.parse(result);
      this.tutorialInfos = data.tutorials;
    }
    return this.tutorialInfos;
  }

  async getStep(tutorialId: string, stepId: string): Promise<ITutorialStepContent> {
    let stepContent = await this.contentLoader.getFileContent(`tutorials/${tutorialId}/${stepId}.md`);
    const md = new markdown({
      html: true // Enable HTML tags in source;
    });
    const resultCodeRegex = /```result[\s\S]*```/g;
    let matches = stepContent.match(resultCodeRegex);
    let resultCode = "";
    if (matches && matches.length > 0) {
      resultCode = matches[0].replace(/```result|```/g, "").trim() + "\r\n";
      stepContent = stepContent.replace(resultCodeRegex, "");
    }

    const initCodeRegex = /```init[\s\S]*```/g;
    matches = stepContent.match(initCodeRegex);
    let initCode = "";
    if (matches && matches.length > 0) {
      initCode = matches[0].replace(/```init|```/g, "");
      stepContent = stepContent.replace(initCodeRegex, "");
    }

    const tutorialStep: ITutorialStepContent = {
      content: md.render(stepContent),
      initialCode: initCode.trim(),
      resultCode: resultCode.trim()
    };
    return tutorialStep;
  }
}

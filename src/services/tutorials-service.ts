import * as markdown from "markdown-it";

export interface ContentLoader {
  getFileContent(relativePath: string): Promise<string>;
  resolveRelativeUrl(relativePath: string): string;
}

export interface TutorialInfo {
  id: string;
  label: string;
  steps: TutorialStepInfo[];
  description: string;
  level: string;
}

export interface TutorialStepInfo {
  id: string;
  name: string;
}

export interface TutorialStepContent {
  content: string;
  solutionCode: string;
}

/**
 * Gets access to tutorials content
 */
export class TutorialsService {
  private tutorialInfos: TutorialInfo[] = [];

  constructor(private contentLoader: ContentLoader) {}

  async getTutorialsList(): Promise<TutorialInfo[]> {
    if (this.tutorialInfos.length == 0) {
      const result = await this.contentLoader.getFileContent("tutorials/index.json");
      const data = JSON.parse(result);
      this.tutorialInfos = data.tutorials;
    }
    return this.tutorialInfos;
  }

  async getStep(tutorialId: string, stepId: string): Promise<TutorialStepContent> {
    let stepContent = await this.contentLoader.getFileContent(
      `tutorials/${tutorialId}/${stepId}.md`
    );
    const md = new markdown({
      html: true // Enable HTML tags in source;
    });
    const solutionCodeRegex = /<!--solution-->[\s\S]*```[\s\S]*```/g;
    const matches = stepContent.match(solutionCodeRegex);
    let solutionCode = "";
    if (matches && matches.length > 0) {
      solutionCode = matches[0].replace(/<!--solution-->|```/g, "").trim() + "\r\n";
      stepContent = stepContent.replace(solutionCodeRegex, "");
    }

    let html = md.render(stepContent).trim();

    // find and fix all relative image urls
    html = html.replace(/src="[\s\S]*?"/g, match => {
      let src = match.substr(5);
      src = src.substr(0, src.length - 1);
      if (src.startsWith(".")) {
        src = src.substring(1);
        src = this.contentLoader.resolveRelativeUrl("tutorials/" + tutorialId + src);
      }
      return 'src="' + src + '"';
    });

    const tutorialStep: TutorialStepContent = {
      content: html,
      solutionCode: solutionCode.trim()
    };
    return tutorialStep;
  }
}

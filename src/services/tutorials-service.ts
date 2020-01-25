import * as markdown from "markdown-it";
import { localStoragePrefix } from "./constants";
import { LocalStorage } from "./local-storage";
import { DictionaryLike } from "utils/syntax";
import { LocalizedJsonString, setLocalizedString } from "utils/localized-json-string";

export interface ContentLoader {
  loadFile(url: string): Promise<string>;
  getCurrentLocaleId(): string;
}

export interface TutorialInfo {
  id: string;
  label: string;
  steps: TutorialStepInfo[];
  description: string;
  level: number;
}

export interface TutorialStepInfo {
  id: string;
  name: string;
}

export interface TutorialStepId {
  tutorialId: string;
  stepId: string;
}
export interface TutorialStepContent {
  content: string;
  solutionCode: string;
  inlinedCode: DictionaryLike<{ code: string; params: any }>;
}

/**
 * Gets access to tutorials content
 */
export class TutorialsService {
  private tutorialInfos: TutorialInfo[] = [];
  readonly defaultStep: TutorialStepId = {
    tutorialId: "01-basics",
    stepId: "01-welcome"
  };
  private lastStepLocalStorage = new LocalStorage<TutorialStepId>(
    localStoragePrefix + "tutorials.step",
    this.defaultStep
  );

  constructor(private contentLoader: ContentLoader) {}

  async getTutorialsList(): Promise<TutorialInfo[]> {
    if (this.tutorialInfos.length == 0) {
      const result = await this.contentLoader.loadFile("content/tutorials/index.json");
      const data = JSON.parse(result);
      this.tutorialInfos = data.tutorials;

      // Process tutorials to resolve localized strings
      const localeId = this.contentLoader.getCurrentLocaleId();
      for (const tutorial of this.tutorialInfos) {
        tutorial.description = setLocalizedString(tutorial.description, localeId);
        tutorial.label = setLocalizedString(tutorial.label, localeId);
        for (const step of tutorial.steps) {
          step.name = setLocalizedString(step.name, localeId);
        }
      }
    }
    return this.tutorialInfos;
  }

  async getStep(tutorialId: string, stepId: string): Promise<TutorialStepContent> {
    let stepContent = await this.contentLoader.loadFile(
      `content/tutorials/${tutorialId}/${stepId}.md`
    );

    let solutionCode = "";
    stepContent = this.findAndReplaceCodeChunks(stepContent, "solution", code => {
      solutionCode = code;
      return "";
    });

    const inlined: DictionaryLike<{ code: string; params: any }> = {};
    let inlinedId = 1;
    stepContent = this.findAndReplaceCodeChunks(stepContent, "logo", (code, params) => {
      if (!params.width) {
        throw new Error("width is required parameter to logo inline block");
      }
      if (!params.height) {
        throw new Error("height is required parameter to logo inline block");
      }
      const id = "logo" + inlinedId++;
      inlined[id] = {
        code: code ? code.trim() : "",
        params
      };
      let result = `<div id="${id}" class="logo-inline-container" style="width:${params.width};height:${params.height}"></div>`;

      // Include the code optionally
      if (params.code) {
        result = "\n```" + code + "```\n" + result;
      }

      // If we have `solution` flag then we need to use it for solutionCode
      if (params.solution) {
        solutionCode = code;
      }

      return result;
    });

    const md = new markdown({
      html: true // Enable HTML tags in source;
    });
    let html = md.render(stepContent).trim();

    // find and fix all relative image urls
    html = html.replace(/src="[\s\S]*?"/g, match => {
      let src = match.substr(5);
      src = src.substr(0, src.length - 1);
      if (src.startsWith(".")) {
        src = src.substring(1);
        src = "content/tutorials/" + tutorialId + src;
      }
      return 'src="' + src + '"';
    });

    const tutorialStep: TutorialStepContent = {
      content: html,
      solutionCode: solutionCode.trim(),
      inlinedCode: inlined
    };
    this.setLastStep({ tutorialId, stepId });
    return tutorialStep;
  }

  getLastStep(): TutorialStepId {
    return this.lastStepLocalStorage.getValue();
  }

  setLastStep(step: TutorialStepId) {
    this.lastStepLocalStorage.setValue(step);
  }

  findAndReplaceCodeChunks(
    md: string,
    type: string,
    replacer: (code: string, params: any) => string
  ): string {
    const chunkRegex = new RegExp(
      "<!--" + type + "([\\s\\S]*?)-->[\\s\\S]*?```([\\s\\S]*?)```",
      "g"
    );
    return md.replace(chunkRegex, (match, params, code) => {
      const paramsObj = params ? JSON.parse(params) : {};
      return replacer(code, paramsObj);
    });
  }
}

import * as markdown from 'markdown-it'
import { ILocalizedContentLoader } from "app/services/infrastructure/localized-content-loader";

export interface ITutorialInfo {
    id: string
    name: string
    steps: number
    description: string
}

export interface ITutorialStep {
    name: string
    index: number
    content: string
    initialCode: string
    resultCode: string
}

/**
 * Gets access to tutorials content
 */
export interface ITutorialsContentService {
    getTutorialsList(): Promise<ITutorialInfo[]>
    getSteps(tutorialId: string): Promise<ITutorialStep[]>
}

export class TutorialsContentService {
    private tutorialInfos: ITutorialInfo[] = [];

    constructor(private contentLoader: ILocalizedContentLoader) {
    }

    private getIdFromIndex(index: number): string {
        let id = (index + 1).toString();
        return id.length > 1 ? id : '0' + id;
    }

    async getTutorialsList(): Promise<ITutorialInfo[]> {
        if (this.tutorialInfos.length == 0) {
            try {
                let result = await this.contentLoader.getFileContent('tutorials/index.json');
                let data = JSON.parse(result);
                this.tutorialInfos = data.tutorials;
                this.tutorialInfos.forEach((t, index) => {
                    t.id = this.getIdFromIndex(index);
                });

            }
            catch (ex) {
                throw ex;
            }
        }
        return this.tutorialInfos;
    }

    async getSteps(tutorialId: string): Promise<ITutorialStep[]> {
        const tutorial = this.tutorialInfos.find(t => t.id === tutorialId);
        if (!tutorial) { return [] };
        let stepContentPromises: Promise<string>[] = [];
        for (let stepIndex = 0; stepIndex < tutorial.steps; ++stepIndex) {
            stepContentPromises.push(this.contentLoader.getFileContent(`tutorials/t${tutorialId}s${this.getIdFromIndex(stepIndex)}.md`));
        }
        const md = new markdown();
        const allStepsContent = await Promise.all(stepContentPromises);
        const steps = allStepsContent.map((stepContent, index) => {
            const resultCodeRegex = /```result[\s\S]*```/g;
            let matches = stepContent.match(resultCodeRegex);
            let resultCode = ''
            if (matches && matches.length > 0) {
                resultCode = matches[0].replace(/```result|```/g, '');
                stepContent = stepContent.replace(resultCodeRegex, '');
            }

            const initCodeRegex = /```init[\s\S]*```/g;
            matches = stepContent.match(resultCodeRegex);
            let initCode = ''
            if (matches && matches.length > 0) {
                initCode = matches[0].replace(/```init|```/g, '');
                stepContent = stepContent.replace(initCodeRegex, '');
            }

            let tutorialStep: ITutorialStep = {
                name: 'Step ' + (index + 1),
                content: md.render(stepContent),
                initialCode: initCode,
                resultCode: resultCode,
                index: index
            }
            return tutorialStep;
        });
        return steps;
    }
}
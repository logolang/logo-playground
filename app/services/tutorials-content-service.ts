import { getFileExtension } from '../utils/formatter-helper';
import { ILocalizedContentLoader } from './localized-content-loader';

export interface ITutorialInfo {
    id: string
    name: string
    steps: number
}

export interface ITutorialStep {
    name: string
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
                this.tutorialInfos.forEach((t, index) => t.id = this.getIdFromIndex(index));
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
        const allStepsContent = await Promise.all(stepContentPromises);
        const steps = allStepsContent.map((stepContent, index) => {
            let tutorialStep: ITutorialStep = {
                name: 'Step ' + (index + 1),
                content: stepContent,
                initialCode: '',
                resultCode: ''
            }
            return tutorialStep;
        });
        return steps;
    }
}
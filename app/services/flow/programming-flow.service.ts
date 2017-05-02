import { Subject } from "rxjs/Rx";
import * as keymaster from 'keymaster';
import { IProgramsRepository } from "app/services/gallery/personal-gallery-localstorage.repository";
import { ProgramModel } from "app/services/gallery/program.model";

export interface IProgramToSaveAttributes {
    name: string
}

export interface ICreateScreenshotCommand {
    isSmall: boolean,
    whenReady: (data: string) => void
}

export class ProgrammingFlowService {
    code = '';
    hasProgramBeenExecutedOnce = false;
    runCommands = new Subject<string>();
    stopCommands = new Subject<void>();
    focusCommands = new Subject<void>();
    makeScreenshotCommands = new Subject<ICreateScreenshotCommand>();

    constructor() {
    }

    initHotkeys() {
        keymaster('f8, f9', () => {
            this.runCurrentProgram();
            return false;
        });
    }

    disposeHotkeys() {
        keymaster.unbind('f8, f9');
    }

    runCurrentProgram = () => {
        this.hasProgramBeenExecutedOnce = true;
        this.runCommands.next(this.code);
        this.focusCommands.next();
    }

    stopCurrentProgram = () => {
        this.stopCommands.next();
        this.focusCommands.next();
    }

    getScreenshot = (small: boolean): Promise<string> => {
        return new Promise<string>(resolve => {
            this.makeScreenshotCommands.next({
                isSmall: small, whenReady: (data: string) => {
                    resolve(data);
                }
            });
        });
    }


    saveCurrentProgramToRepository = async (programAttributes: IProgramToSaveAttributes, repository: IProgramsRepository): Promise<ProgramModel> => {
        const programName = programAttributes.name;

        if (!programName || !programName.trim()) {
            throw new Error('Program name is required.');
        }
        const allProgs = await repository.getAll();

        const progWithSameName = allProgs.find(p => p.name.trim().toLowerCase() === programName.trim().toLowerCase());
        if (progWithSameName) {
            throw new Error('Program with this name is already stored in library. Please enter different name.');
        }

        let screenshot = this.hasProgramBeenExecutedOnce
            ? await this.getScreenshot(true)
            : '';
        
        const addedProgram = repository.add(
            new ProgramModel('', programName, "logo", this.code, screenshot)
        );

        return addedProgram;
    }

    saveCurrentProgram = async (programId: string, repository: IProgramsRepository): Promise<boolean> => {
        const prog = await repository.get(programId);
        if (this.hasProgramBeenExecutedOnce) {
            prog.screenshot = await this.getScreenshot(true);
        }
        prog.code = this.code;
        await repository.update(prog);
        return true;
    }
}
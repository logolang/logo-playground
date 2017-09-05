import { IProgramsRepository } from "app/services/gallery/personal-gallery-localstorage.repository";
import { ProgramModel } from "app/services/program/program.model";
import { ProgramExecutionService } from "app/services/program/program-execution.service";
import { ensure } from "app/utils/syntax-helpers";

const defaultPlaygroundProgram = `
;This is LOGO program sample
forward 50
right 90
forward 100
arc 360 50
`;

export enum ProgramStorageType {
  samples = "samples",
  gallery = "gallery",
  gist = "gist"
}

export interface IProgramToSaveAttributes {
  name: string;
  programId: string;
  code: string;
}

export class ProgramManagementService {
  constructor(
    private examplesRepository: IProgramsRepository,
    private personalRepository: IProgramsRepository,
    private executionService: ProgramExecutionService
  ) {}

  loadProgram = async (storageType?: ProgramStorageType, programId?: string): Promise<ProgramModel> => {
    let program: ProgramModel | undefined = undefined;

    if (!storageType || !programId) {
      program = new ProgramModel("", "", "logo", defaultPlaygroundProgram, "");
    } else {
      switch (storageType) {
        case ProgramStorageType.samples:
          program = await this.examplesRepository.get(programId);
          break;
        case ProgramStorageType.gallery:
          program = await this.personalRepository.get(programId);
          break;
        case ProgramStorageType.gist:
          throw new Error("Not implemented");
      }
    }

    if (!program) {
      throw new Error("Could not load the program");
    }
    /*
    const programLocalId = programId || "";
    const userData = await this.userDataService.getData();
    if (userData.codeLocalStorage) {
      const localCode = userData.codeLocalStorage[programLocalId];
      program.code = localCode;
      program.hasUnsavedModifications = true;
    }*/
    return program;
  };

  saveProgram = async (programAttributes: IProgramToSaveAttributes): Promise<ProgramModel> => {
    if (programAttributes.programId) {
      const prog = await this.personalRepository.get(programAttributes.programId);
      prog.screenshot = await this.executionService.getScreenshot(true);
      prog.code = programAttributes.code;
      prog.name = programAttributes.name;
      const savedProgram = await this.personalRepository.update(prog);
      return savedProgram;
    } else {
      const programName = programAttributes.name;
      if (!programName || !programName.trim()) {
        throw new Error("Program name is required.");
      }
      const allProgs = await this.personalRepository.getAll();
      const progWithSameName = allProgs.find(p => p.name.trim().toLowerCase() === programName.trim().toLowerCase());
      if (progWithSameName) {
        throw new Error("Program with this name is already stored in library. Please enter different name.");
      }
      const screenshot = await this.executionService.getScreenshot(true);
      const addedProgram = this.personalRepository.add(
        new ProgramModel("", programName, "logo", programAttributes.code, screenshot)
      );
      return addedProgram;
    }
  };
}

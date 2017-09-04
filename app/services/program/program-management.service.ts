import { IProgramsRepository } from "app/services/gallery/personal-gallery-localstorage.repository";
import { ProgramModel } from "app/services/program/program.model";
import { ProgramExecutionService } from "app/services/program/program-execution.service";
import { IUserDataService } from "app/services/customizations/user-data.service";
import { ensure } from "app/utils/syntax-helpers";

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
    private executionService: ProgramExecutionService,
    private userDataService: IUserDataService
  ) {}

  loadProgram = async (storageType?: ProgramStorageType, programId?: string): Promise<ProgramModel> => {
    if (!storageType || !programId) {
      const code = await this.userDataService.getPlaygroundCode();
      return new ProgramModel("", "", "logo", code, "");
    }
    switch (storageType) {
      case ProgramStorageType.samples:
        return this.examplesRepository.get(programId);
      case ProgramStorageType.gallery:
        return this.personalRepository.get(programId);
      case ProgramStorageType.gist:
        throw new Error("Not implemented");
    }
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

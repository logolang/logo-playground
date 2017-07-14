import { IProgramsRepository } from "app/services/gallery/personal-gallery-localstorage.repository";
import { ProgramModel } from "app/services/program/program.model";
import { ProgramExecutionService } from "app/services/program/program-execution.service";
import { IUserDataService } from "app/services/customizations/user-data.service";

export type ProgramStorageType = "playground" | "samples" | "gallery" | "gist";

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

  loadProgram = async (programId: string, storageType: ProgramStorageType): Promise<ProgramModel> => {
    switch (storageType) {
      case "playground":
        const code = await this.userDataService.getPlaygroundCode();
        return new ProgramModel("", "", "logo", code, "");
      case "samples":
        return this.examplesRepository.get(programId);
      case "gallery":
        return this.personalRepository.get(programId);
      case "gist":
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

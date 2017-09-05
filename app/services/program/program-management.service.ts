import { injectable, inject } from "app/di";
import { ensure } from "app/utils/syntax-helpers";

import {
  IProgramsRepository,
  ProgramsLocalStorageRepository
} from "app/services/gallery/personal-gallery-localstorage.repository";
import { ProgramModel } from "app/services/program/program.model";
import { ProgramsSamplesRepository } from "app/services/gallery/gallery-samples.repository";
import { ILocalTempCodeStorage } from "app/services/program/local-temp-code.storage";

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

@injectable()
export class ProgramManagementService {
  constructor(
    @inject(ProgramsSamplesRepository) private examplesRepository: IProgramsRepository,
    @inject(ProgramsLocalStorageRepository) private personalRepository: IProgramsRepository,
    @inject(ILocalTempCodeStorage) private localTempStorage: ILocalTempCodeStorage
  ) {}

  loadProgram = async (storageType?: ProgramStorageType, programId?: string): Promise<ProgramModel> => {
    const program = await this.loadProgramFromStorage(storageType, programId);

    const tempCode = await this.localTempStorage.getCode(programId || "");
    if (tempCode) {
      program.code = tempCode;
      program.hasTempLocalModifications = true;
    }
    return program;
  };

  saveTempProgram = async (programId: string, code: string): Promise<void> => {
    this.localTempStorage.setCode(programId, code);
  };

  revertLocalTempChanges = async (programModel: ProgramModel): Promise<string> => {
    const program = await this.loadProgramFromStorage(programModel.storageType, programModel.id);
    await this.saveTempProgram(program.id, "");
    return program.code;
  };

  saveProgramAs = async (code: string, screenshot: string, program: ProgramModel): Promise<ProgramModel> => {
    const programName = program.name;
    if (!programName || !programName.trim()) {
      throw new Error("Program name is required.");
    }
    const allProgs = await this.personalRepository.getAll();
    const progWithSameName = allProgs.find(p => p.name.trim().toLowerCase() === programName.trim().toLowerCase());
    if (progWithSameName) {
      throw new Error("Program with this name is already stored in library. Please enter different name.");
    }
    const addedProgram = this.personalRepository.add(
      new ProgramModel("", ProgramStorageType.gallery, programName, "logo", code, screenshot)
    );
    await this.saveTempProgram(program.id, "");
    return addedProgram;
  };

  saveProgram = async (code: string, screenshot: string, program: ProgramModel): Promise<ProgramModel> => {
    if (program.id && program.storageType === ProgramStorageType.gallery) {
      const prog = await this.personalRepository.get(program.id);
      prog.screenshot = screenshot;
      prog.code = code;
      prog.name = program.name;
      const savedProgram = await this.personalRepository.update(prog);
      await this.saveTempProgram(program.id, "");
      return savedProgram;
    }
    throw new Error("Program is from wrong source");
  };

  private async loadProgramFromStorage(storageType?: ProgramStorageType, programId?: string): Promise<ProgramModel> {
    let program: ProgramModel | undefined = undefined;

    if (!storageType || !programId) {
      program = new ProgramModel("", undefined, "", "logo", defaultPlaygroundProgram, "");
    } else {
      switch (storageType) {
        case ProgramStorageType.samples:
          program = await this.examplesRepository.get(programId);
          program.storageType = ProgramStorageType.samples;
          break;
        case ProgramStorageType.gallery:
          program = await this.personalRepository.get(programId);
          program.storageType = ProgramStorageType.gallery;
          break;
        case ProgramStorageType.gist:
          throw new Error("Not implemented");
      }
    }

    if (!program) {
      throw new Error("Could not load the program");
    }
    return program;
  }
}

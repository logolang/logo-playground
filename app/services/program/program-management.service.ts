import { injectable, inject } from "app/di";

import { IUserLibraryRepository } from "app/services/gallery/personal-gallery-localstorage.repository";
import { ProgramModel } from "app/services/program/program.model";
import { IGallerySamplesRepository } from "app/services/gallery/gallery-samples.repository";
import { LocalTempCodeStorage } from "app/services/program/local-temp-code.storage";
import { ProgramModelConverter } from "app/services/program/program-model.converter";
import { GistSharedProgramsRepository } from "app/services/program/gist-shared-programs.repository";

export enum ProgramStorageType {
  samples = "samples",
  gallery = "gallery",
  gist = "gist"
}

export interface IProgramToSaveAttributes {
  name: string;
  programId: string;
}

@injectable()
export class ProgramManagementService {
  constructor(
    @inject(IGallerySamplesRepository) private examplesRepository: IGallerySamplesRepository,
    @inject(IUserLibraryRepository) private personalRepository: IUserLibraryRepository,
    @inject(LocalTempCodeStorage) private localTempStorage: LocalTempCodeStorage,
    @inject(GistSharedProgramsRepository) private gistRepository: GistSharedProgramsRepository
  ) {}

  loadProgram = async (programId?: string, storageType?: ProgramStorageType): Promise<ProgramModel> => {
    const program = await this.loadProgramFromStorage(storageType, programId);

    const tempCode = this.localTempStorage.getCode(programId || "");
    if (tempCode) {
      program.code = tempCode;
      program.hasTempLocalModifications = true;
    }
    return program;
  };

  saveTempProgram = (programId: string, code: string): void => {
    this.localTempStorage.setCode(programId, code);
  };

  revertLocalTempChanges = async (programModel: ProgramModel): Promise<string> => {
    const program = await this.loadProgramFromStorage(programModel.storageType, programModel.id);
    this.saveTempProgram(program.id, "");
    return program.code;
  };

  async initLocalModificationsFlag(programs: ProgramModel[]) {
    for (const program of programs) {
      const tempCode = this.localTempStorage.getCode(program.id);
      if (tempCode) {
        program.hasTempLocalModifications = true;
      }
    }
  }

  saveProgramToLibrary = async (
    newProgramName: string,
    newScreenshot: string,
    newCode: string,
    program: ProgramModel,
    allowOverwrite: boolean
  ): Promise<ProgramModel> => {
    if (!newProgramName || !newProgramName.trim()) {
      throw new Error("Program name is required.");
    }
    const allProgs = await this.personalRepository.getAll();
    if (!allowOverwrite) {
      const progWithSameName = allProgs.find(p => p.name.trim().toLowerCase() === newProgramName.trim().toLowerCase());
      if (progWithSameName) {
        throw new Error("Program with this name is already stored in library. Please enter different name.");
      }
      const newProgram = ProgramModelConverter.createNewProgram(
        ProgramStorageType.gallery,
        newProgramName,
        newCode,
        newScreenshot
      );
      await this.personalRepository.add([newProgram]);
      if (program.id) {
        await this.saveTempProgram(program.id, "");
      }
      return newProgram;
    } else {
      program.screenshot = newScreenshot;
      program.code = newCode;
      await this.personalRepository.save(program);
      if (program.id) {
        await this.saveTempProgram(program.id, "");
      }
      return program;
    }
  };

  private async loadProgramFromStorage(storageType?: ProgramStorageType, programId?: string): Promise<ProgramModel> {
    let program: ProgramModel | undefined = undefined;

    if (!storageType || !programId) {
      program = ProgramModelConverter.createNewProgram(undefined, "", "", "");
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
          program = await this.gistRepository.get(programId);
          program.storageType = ProgramStorageType.gist;
          break;
      }
    }

    if (!program) {
      throw new Error("Could not load the program");
    }
    return program;
  }
}

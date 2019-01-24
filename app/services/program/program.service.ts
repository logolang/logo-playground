import { ProgramModel, ProgramStorageType } from "app/services/program/program.model";
import { GallerySamplesRepository } from "app/services/gallery/gallery-samples.repository";
import { LocalTempCodeStorage } from "app/services/program/local-temp-code.storage";
import { ProgramModelConverter } from "app/services/program/program-model.converter";
import { GistSharedProgramsRepository } from "app/services/program/gist-shared-programs.repository";
import { PersonalGalleryService } from "app/services/gallery/personal-gallery.service";

export class ProgramService {
  constructor(
    private examplesRepository: GallerySamplesRepository,
    private personalGalleryService: PersonalGalleryService,
    private localTempStorage: LocalTempCodeStorage,
    private gistRepository: GistSharedProgramsRepository
  ) {}

  loadProgram = async (
    storageType: ProgramStorageType,
    programId?: string
  ): Promise<ProgramModel> => {
    if (programId && storageType != ProgramStorageType.playground) {
      const program = await this.loadProgramFromStorage(storageType, programId);
      return program;
    }

    const tempCode = this.localTempStorage.getCode("playground");
    const program = ProgramModelConverter.createNewProgram(
      ProgramStorageType.playground,
      "",
      tempCode,
      ""
    );
    return program;
  };

  saveProgramToLibrary = async (options: {
    id?: string;
    newProgramName: string;
    newScreenshot: string;
    newCode: string;
  }): Promise<ProgramModel> => {
    if (!options.newProgramName || !options.newProgramName.trim()) {
      throw new Error("Program name is required.");
    }
    const allProgs = (await this.personalGalleryService.getAll()) || [];
    if (!options.id) {
      const progWithSameName = allProgs.find(
        p => p.name.trim().toLowerCase() === options.newProgramName.trim().toLowerCase()
      );
      if (progWithSameName) {
        throw new Error(
          "Program with this name is already stored in library. Please enter different name."
        );
      }
      const newProgram = ProgramModelConverter.createNewProgram(
        ProgramStorageType.gallery,
        options.newProgramName,
        options.newCode,
        options.newScreenshot
      );
      await this.personalGalleryService.add([newProgram]);
      return newProgram;
    } else {
      const program = allProgs.find(p => p.id === options.id);
      if (!program) {
        throw new Error("Program with id is not found: " + options.id);
      }
      program.screenshot = options.newScreenshot;
      program.code = options.newCode;
      program.name = options.newProgramName;
      await this.personalGalleryService.save(program);
      return program;
    }
  };

  private async loadProgramFromStorage(
    storageType: ProgramStorageType,
    programId: string
  ): Promise<ProgramModel> {
    let program: ProgramModel | undefined;

    switch (storageType) {
      case ProgramStorageType.samples:
        program = await this.examplesRepository.get(programId);
        program.storageType = ProgramStorageType.samples;
        break;
      case ProgramStorageType.gallery:
        program = await this.personalGalleryService.get(programId);
        program.storageType = ProgramStorageType.gallery;
        break;
      case ProgramStorageType.gist:
        program = await this.gistRepository.get(programId);
        program.storageType = ProgramStorageType.gist;
        break;
    }

    if (!program) {
      throw new Error("Could not load the program");
    }
    return program;
  }
}

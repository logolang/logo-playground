import { ProgramModel, ProgramStorageType, createNewProgram } from "services/program.model";
import { GallerySamplesRepository } from "services/gallery-samples.repository";
import { LocalPlaygroundCodeStorage } from "services/local-playground-code.storage";
import { SharedProgramsRepository } from "services/programs-shared.repository";
import { GalleryService } from "services/gallery.service";

export class ProgramService {
  constructor(
    private examplesRepository: GallerySamplesRepository,
    private personalGalleryService: GalleryService,
    private localTempStorage: LocalPlaygroundCodeStorage,
    private sharedProgramsRepository: SharedProgramsRepository
  ) {}

  loadProgram = async (
    storageType: ProgramStorageType,
    programId?: string
  ): Promise<ProgramModel> => {
    if (programId && storageType != ProgramStorageType.playground) {
      return this.loadProgramFromStorage(storageType, programId);
    }

    const program = createNewProgram({
      storageType: ProgramStorageType.playground,
      code: this.localTempStorage.getCode()
    });
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
      const newProgram = createNewProgram({
        storageType: ProgramStorageType.gallery,
        name: options.newProgramName,
        code: options.newCode,
        screenshot: options.newScreenshot
      });
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
      case ProgramStorageType.shared:
        program = await this.sharedProgramsRepository.get(programId);
        program.storageType = ProgramStorageType.shared;
        break;
    }

    if (!program) {
      throw new Error("Could not load the program");
    }
    return program;
  }
}

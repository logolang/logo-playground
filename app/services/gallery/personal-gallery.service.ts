import { ProgramModel } from "app/services/program/program.model";
import { PersonalGalleryLocalRepository } from "app/services/gallery/personal-gallery-local.repository";
import { PersonalGalleryRemoteRepository } from "app/services/gallery/personal-gallery-remote.repository";

export class PersonalGalleryService {
  constructor(
    private localProgramsRepository: PersonalGalleryLocalRepository,
    private remoteProgramsRepository?: PersonalGalleryRemoteRepository
  ) {}

  async getAll(): Promise<ProgramModel[]> {
    if (this.remoteProgramsRepository) {
      const programs = await this.remoteProgramsRepository.getAll();
      this.localProgramsRepository.overwrite(programs);
      return programs;
    } else {
      return this.localProgramsRepository.getAll();
    }
  }

  getAllLocal(): ProgramModel[] {
    return this.localProgramsRepository.getAll();
  }

  async get(id: string): Promise<ProgramModel> {
    return this.remoteProgramsRepository
      ? this.remoteProgramsRepository.get(id)
      : this.localProgramsRepository.get(id);
  }

  async add(programs: ProgramModel[]): Promise<void> {
    this.localProgramsRepository.add(programs);
    if (this.remoteProgramsRepository) {
      await this.remoteProgramsRepository.add(programs);
    }
  }

  async save(programToSave: ProgramModel): Promise<void> {
    this.localProgramsRepository.save(programToSave);
    if (this.remoteProgramsRepository) {
      await this.remoteProgramsRepository.save(programToSave);
    }
  }

  async remove(id: string): Promise<void> {
    this.localProgramsRepository.remove(id);
    if (this.remoteProgramsRepository) {
      await this.remoteProgramsRepository.remove(id);
    }
  }
}

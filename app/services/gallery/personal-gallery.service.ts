import { injectable, inject } from "app/di";
import { ProgramModel } from "app/services/program/program.model";
import { PersonalGalleryLocalRepository } from "app/services/gallery/personal-gallery-local.repository";
import { IPersonalGalleryRemoteRepository } from "app/services/gallery/personal-gallery-remote.repository";

@injectable()
export class PersonalGalleryService {
  constructor(
    @inject(PersonalGalleryLocalRepository) private localProgramsRepository: PersonalGalleryLocalRepository,
    @inject(IPersonalGalleryRemoteRepository) private remoteProgramsRepository?: IPersonalGalleryRemoteRepository
  ) {}

  async getAll(): Promise<ProgramModel[] | undefined> {
    const all =
      (await (this.remoteProgramsRepository
        ? this.remoteProgramsRepository.getAll()
        : this.localProgramsRepository.getAll())) || [];
    await this.localProgramsRepository.overwrite(all);
    return all;
  }

  async getAllLocal(): Promise<ProgramModel[] | undefined> {
    return this.localProgramsRepository.getAll();
  }

  async get(id: string): Promise<ProgramModel> {
    return this.remoteProgramsRepository ? this.remoteProgramsRepository.get(id) : this.localProgramsRepository.get(id);
  }

  async add(programs: ProgramModel[]): Promise<void> {
    await this.localProgramsRepository.add(programs);
    if (this.remoteProgramsRepository) {
      await this.remoteProgramsRepository.add(programs);
    }
  }

  async save(programToSave: ProgramModel): Promise<void> {
    await this.localProgramsRepository.save(programToSave);
    if (this.remoteProgramsRepository) {
      await this.remoteProgramsRepository.save(programToSave);
    }
  }

  async remove(id: string): Promise<void> {
    await this.localProgramsRepository.remove(id);
    if (this.remoteProgramsRepository) {
      await this.remoteProgramsRepository.remove(id);
    }
  }
}

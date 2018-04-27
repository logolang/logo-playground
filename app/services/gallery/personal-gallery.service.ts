import { injectable, inject } from "app/di";
import { ProgramModel } from "app/services/program/program.model";
import { PersonalGalleryLocalRepository } from "app/services/gallery/personal-gallery-local.repository";
import { IPersonalGalleryRemoteRepository } from "app/services/gallery/personal-gallery-remote.repository";

@injectable()
export class PersonalGalleryService {
  constructor(
    @inject(PersonalGalleryLocalRepository) private localRepository: PersonalGalleryLocalRepository,
    @inject(IPersonalGalleryRemoteRepository) private remoteRepository: IPersonalGalleryRemoteRepository
  ) {}

  async getAll(): Promise<ProgramModel[]> {
    const all = await this.remoteRepository.getAll();
    await this.localRepository.overwrite(all);
    return all;
  }

  async getAllLocal(): Promise<ProgramModel[]> {
    return this.localRepository.getAll();
  }

  async get(id: string): Promise<ProgramModel> {
    return this.remoteRepository.get(id);
  }

  async add(programs: ProgramModel[]): Promise<void> {
    await this.localRepository.add(programs);
    return this.remoteRepository.add(programs);
  }

  async save(programToSave: ProgramModel): Promise<void> {
    await this.localRepository.save(programToSave);
    return this.remoteRepository.save(programToSave);
  }

  async remove(id: string): Promise<void> {
    await this.localRepository.remove(id);
    return this.remoteRepository.remove(id);
  }
}

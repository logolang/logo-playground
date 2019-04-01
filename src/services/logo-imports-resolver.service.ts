import { GalleryLocalRepository } from "./gallery-local.repository";
import { GallerySamplesRepository } from "./gallery-samples.repository";
import { ProgramModel } from "./program.model";

export class LogoImportsResolverService {
  private programs: ProgramModel[] = [];

  constructor(
    private localProgramsRepository: GalleryLocalRepository,
    private examplesRepository: GallerySamplesRepository
  ) {}

  async reset(): Promise<void> {
    this.programs = [];
  }

  async resolve(module: string): Promise<string> {
    if (this.programs.length === 0) {
      await this.loadPrograms();
    }
    const p = this.programs.find(x => x.name.toLowerCase().trim() === module);
    if (p) {
      return p.code;
    }
    return "";
  }

  private async loadPrograms() {
    this.programs.push(...this.localProgramsRepository.getAll());
    this.programs.push(...(await this.examplesRepository.getAll("shapes")));
    this.programs.push(...(await this.examplesRepository.getAll("samples")));
  }
}

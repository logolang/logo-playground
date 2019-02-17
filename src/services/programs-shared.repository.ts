import { ProgramModel, ProgramStorageType } from "services/program.model";
import { SharedProgramsUrlEncoder } from "services/infrastructure/shared-programs-url-encoder";

export class SharedProgramsRepository {
  private repo = new SharedProgramsUrlEncoder();

  async get(id: string): Promise<ProgramModel> {
    const data = await this.repo.get(id);
    const program: ProgramModel = {
      id: id,
      code: data.text,
      dateCreated: new Date(),
      dateLastEdited: new Date(),
      name: data.name,
      screenshot: "",
      storageType: ProgramStorageType.shared
    };
    return program;
  }

  async post(programName: string, code: string): Promise<string> {
    return this.repo.post(programName, code);
  }
}

import { ProgramModel, ProgramStorageType } from "app/services/program/program.model";
import { AppConfig } from "../env/app-config";
import { SharedProgramsUrlEncoder } from "../infrastructure/shared-programs-url-encoder";

export class SharedProgramsRepository {
  constructor(private config: AppConfig) {}

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

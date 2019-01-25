import { ProgramModel, ProgramStorageType } from "app/services/program/program.model";
import { GistClient } from "../infrastructure/gist.client";

export class GistSharedProgramsRepository {
  private gistClient = new GistClient();

  async get(id: string): Promise<ProgramModel> {
    const data = await this.gistClient.get(id);
    const program: ProgramModel = {
      id: id,
      code: data.text,
      dateCreated: new Date(),
      dateLastEdited: new Date(),
      name: data.name,
      screenshot: "",
      storageType: ProgramStorageType.gist
    };
    return program;
  }

  async post(programName: string, code: string): Promise<string> {
    return this.gistClient.post(programName, code);
  }
}

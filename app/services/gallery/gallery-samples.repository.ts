import { ProgramModel } from "app/services/program/program.model";
import { IProgramsRepository } from "app/services/gallery/personal-gallery-localstorage.repository";
import { injectable } from "app/di";

const data = require("./gallery-samples.json").map((rec: any) => ProgramModel.fromJson(rec)) as ProgramModel[];
data.sort((p1, p2) => {
  return p1.dateLastEdited > p2.dateLastEdited ? -1 : 1;
});

@injectable()
export class ProgramsSamplesRepository implements IProgramsRepository {
  async getAll(): Promise<ProgramModel[]> {
    return data;
  }

  async get(id: string): Promise<ProgramModel> {
    const p = data.find(d => d.id === id);
    if (!p) {
      throw new Error(`Program with id ${id} is not found`);
    }
    return p;
  }

  async add(program: ProgramModel): Promise<ProgramModel> {
    throw new Error();
  }

  async update(program: ProgramModel): Promise<ProgramModel> {
    throw new Error();
  }

  async remove(id: string): Promise<void> {
    throw new Error();
  }
}

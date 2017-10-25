import { ProgramModel } from "app/services/program/program.model";
import { injectable } from "app/di";
import { ProgramModelConverter } from "app/services/program/program-model.converter";

const data = require("./gallery-samples.json").map((rec: any) => ProgramModelConverter.fromJson(rec)) as ProgramModel[];
data.sort((p1, p2) => {
  return p1.dateLastEdited > p2.dateLastEdited ? -1 : 1;
});

export abstract class IGallerySamplesRepository {
  abstract getAll(): Promise<ProgramModel[]>;
  abstract get(id: string): Promise<ProgramModel>;
}

@injectable()
export class GallerySamplesRepository implements IGallerySamplesRepository {
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
}

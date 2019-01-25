import { RandomHelper } from "app/utils/random";
import { ProgramModel, ProgramStorageType } from "app/services/program/program.model";
import { ProgramModelConverter } from "app/services/program/program-model.converter";

export class PersonalGalleryLocalRepository {
  storageKey = "";
  storage: Storage = window.localStorage;

  constructor(userEmail: string) {
    const userId = userEmail || "guest";
    this.storageKey = "logo-playground.gallery:" + userId;
  }

  async getAll(): Promise<ProgramModel[]> {
    const stored = this.storage.getItem(this.storageKey);
    if (stored) {
      const all = ProgramModelConverter.fromJson(JSON.parse(stored));
      for (const p of all) {
        p.storageType = ProgramStorageType.gallery;
      }
      return all;
    }
    return [];
  }

  async get(id: string): Promise<ProgramModel> {
    const all = (await this.getAll()) || [];
    const program = all.find(p => p.id === id);
    if (!program) {
      throw new Error(`Program with id ${id} is not found`);
    }
    return program;
  }

  async add(programs: ProgramModel[]): Promise<void> {
    const all = (await this.getAll()) || [];
    this.addAndSave(all, programs, true);
  }

  async save(programToSave: ProgramModel): Promise<void> {
    const all = (await this.getAll()) || [];
    const program = all.find(p => p.id === programToSave.id);
    if (!program) {
      throw new Error(`Program with id ${programToSave.id} is not found`);
    }
    program.code = programToSave.code;
    program.screenshot = programToSave.screenshot;
    program.dateLastEdited = new Date();
    this.storage.setItem(this.storageKey, ProgramModelConverter.toJson(all));
  }

  async remove(id: string): Promise<void> {
    const all = (await this.getAll()) || [];
    const updated = all.filter(p => p.id !== id);
    this.storage.setItem(this.storageKey, ProgramModelConverter.toJson(updated));
  }

  async overwrite(programs: ProgramModel[]) {
    this.addAndSave([], programs, false);
  }

  private addAndSave(
    oldPrograms: ProgramModel[],
    newPrograms: ProgramModel[],
    updateDate: boolean
  ) {
    const all = [...oldPrograms];
    for (const program of newPrograms) {
      if (!program.id) {
        program.id = RandomHelper.getRandomObjectId(32);
      }
      if (updateDate) {
        program.dateCreated = new Date();
        program.dateLastEdited = new Date();
      }
      all.push(program);
      this.storage.setItem(this.storageKey, ProgramModelConverter.toJson(all));
    }
  }
}

import { RandomHelper } from "utils/random";
import { ProgramModel, ProgramStorageType } from "services/program.model";
import { localStoragePrefix } from "./constants";
import { LocalStorage } from "./local-storage";

export class GalleryLocalRepository {
  private localStorage: LocalStorage<ProgramModel[]>;

  constructor(userEmail: string) {
    const storageKey = localStoragePrefix + "gallery:" + (userEmail || "guest");
    this.localStorage = new LocalStorage<ProgramModel[]>(storageKey, []);
  }

  getAll(): ProgramModel[] {
    const stored = this.localStorage.getValue();
    // Reconstruct dates from JSON
    for (const p of stored) {
      p.dateCreated = new Date(p.dateCreated);
      p.dateLastEdited = new Date(p.dateLastEdited);
    }
    return stored;
  }

  get(id: string): ProgramModel {
    const all = this.getAll();
    const program = all.find(p => p.id === id);
    if (!program) {
      throw new Error(`Program with id ${id} is not found`);
    }
    return program;
  }

  add(programs: ProgramModel[]): void {
    const all = this.getAll();
    this.addAndSave(all, programs, true);
  }

  save(programToSave: ProgramModel): void {
    const all = this.getAll();
    const program = all.find(p => p.id === programToSave.id);
    if (!program) {
      throw new Error(`Program with id ${programToSave.id} is not found`);
    }
    program.code = programToSave.code;
    program.screenshot = programToSave.screenshot;
    program.dateLastEdited = new Date();
    this.localStorage.setValue(all);
  }

  remove(id: string): void {
    const all = this.getAll();
    const updated = all.filter(p => p.id !== id);
    this.localStorage.setValue(updated);
  }

  overwrite(programs: ProgramModel[]) {
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
      program.storageType = ProgramStorageType.gallery;
      all.push(program);
    }
    this.localStorage.setValue(all);
  }
}

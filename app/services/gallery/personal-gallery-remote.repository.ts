import { ProgramModel } from "app/services/program/program.model";

export abstract class IPersonalGalleryRemoteRepository implements IPersonalGalleryRepository {
  abstract getAll(): Promise<ProgramModel[] | undefined>;
  abstract get(id: string): Promise<ProgramModel>;
  abstract add(programs: ProgramModel[]): Promise<void>;
  abstract save(program: ProgramModel): Promise<void>;
  abstract remove(id: string): Promise<void>;
}

export interface IPersonalGalleryRepository {
  getAll(): Promise<ProgramModel[] | undefined>;
  get(id: string): Promise<ProgramModel>;
  add(programs: ProgramModel[]): Promise<void>;
  save(program: ProgramModel): Promise<void>;
  remove(id: string): Promise<void>;
}

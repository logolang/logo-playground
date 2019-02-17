import { ProgramModel } from "services/program.model";

export abstract class GalleryRemoteRepository {
  abstract getAll(): Promise<ProgramModel[]>;
  abstract get(id: string): Promise<ProgramModel>;
  abstract add(programs: ProgramModel[]): Promise<void>;
  abstract save(program: ProgramModel): Promise<void>;
  abstract remove(id: string): Promise<void>;
}

import { ProgramStorageType } from "services/program.model";

export interface PlaygroundState {
  isLoading: boolean;
  storageType: ProgramStorageType;
  programId: string;
  code: string;
  programName: string;
  hasModifications: boolean;
  isRunning: boolean;
}

export const defaultPlaygroundState: PlaygroundState = {
  isLoading: true,
  storageType: ProgramStorageType.samples,
  programId: "",
  code: "",
  programName: "",
  hasModifications: false,
  isRunning: false
};

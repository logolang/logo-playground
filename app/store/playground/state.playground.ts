import { ProgramStorageType } from "app/services/program/program.model";

export interface PlaygroundState {
  isLoading: boolean;
  storageType: ProgramStorageType | undefined;
  programId: string | undefined;
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

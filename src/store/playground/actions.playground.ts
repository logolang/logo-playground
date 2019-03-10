import { action, ActionType } from "typesafe-actions";
import { ProgramStorageType, ProgramModel } from "services/program.model";

export enum PlaygroundActionType {
  LOAD_PROGRAM_STARTED = "LOAD_PROGRAM_STARTED",
  LOAD_PROGRAM_COMPLETED = "LOAD_PROGRAM_COMPLETED",
  CODE_CHANGED = "CODE_CHANGED",
  RUN_PROGRAM = "RUN_PROGRAM",
  STOP_PROGRAM = "STOP_PROGRAM",
  SYNC_PROGRAM_STARTED = "SYNC_PROGRAM_STARTED",
  SYNC_PROGRAM_COMPLETED = "SYNC_PROGRAM_COMPLETED",
  SYNC_PROGRAM_FAILED = "SYNC_PROGRAM_FAILED",
  RESET_STATE = "CLEAR_PROGRAM",
  REVERT_CHANGES = "REVERT_CHANGES"
}

export const playgroundActionCreator = {
  loadProgramStarted: (storageType: ProgramStorageType, programId: string) =>
    action(PlaygroundActionType.LOAD_PROGRAM_STARTED, {
      storageType,
      programId
    }),

  loadProgramCompleted: (
    programModel: ProgramModel,
    storageType: ProgramStorageType,
    programId: string
  ) =>
    action(PlaygroundActionType.LOAD_PROGRAM_COMPLETED, {
      programModel,
      storageType,
      programId
    }),

  codeChangedAction: (code: string) => action(PlaygroundActionType.CODE_CHANGED, { code }),

  runProgram: () => action(PlaygroundActionType.RUN_PROGRAM),

  stopProgram: () => action(PlaygroundActionType.STOP_PROGRAM),

  syncProgramStarted: () => action(PlaygroundActionType.SYNC_PROGRAM_STARTED),

  syncProgramCompleted: (options: {
    newId?: string;
    newName?: string;
    newStorageType?: ProgramStorageType;
  }) => action(PlaygroundActionType.SYNC_PROGRAM_COMPLETED, options),

  syncProgramFailed: () => action(PlaygroundActionType.SYNC_PROGRAM_FAILED),

  clearProgram: () => action(PlaygroundActionType.RESET_STATE)
};

export type PlaygroundAction = ActionType<typeof playgroundActionCreator>;

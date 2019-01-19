import { Dispatch } from "react";
import { Action } from "redux";
import { action, ActionType } from "typesafe-actions";

import { createCompareFunction } from "app/utils/syntax-helpers";
import { resolveInject } from "app/di";
import { GetState } from "app/store/store";
import { ProgramStorageType, ProgramModel } from "app/services/program/program.model";
import { stay } from "app/utils/async-helpers";
import { ProgramModelConverter } from "app/services/program/program-model.converter";
import { ProgramManagementService } from "app/services/program/program-management.service";

export enum PlaygroundActionType {
  LOAD_PROGRAM_STARTED = "LOAD_PROGRAM_STARTED",
  LOAD_PROGRAM_COMPLETED = "LOAD_PROGRAM_COMPLETED",
  CODE_CHANGED = "CODE_CHANGED",
  RUN_PROGRAM = "RUN_PROGRAM",
  STOP_PROGRAM = "STOP_PROGRAM"
}

export const playgroundActionCreator = {
  loadProgram: loadProgramThunk,

  loadProgramStarted: (storageType?: ProgramStorageType, programId?: string) =>
    action(PlaygroundActionType.LOAD_PROGRAM_STARTED, {
      storageType,
      programId
    }),

  loadProgramCompleted: (programModel: ProgramModel, storageType?: ProgramStorageType, programId?: string) =>
    action(PlaygroundActionType.LOAD_PROGRAM_COMPLETED, {
      programModel,
      storageType,
      programId
    }),
  codeChanged: (code: string) =>
    action(PlaygroundActionType.CODE_CHANGED, {
      code
    }),
  runProgram: () => action(PlaygroundActionType.RUN_PROGRAM),
  stopProgram: () => action(PlaygroundActionType.STOP_PROGRAM)
};

function loadProgramThunk(storageType?: ProgramStorageType, programId?: string) {
  return async (dispatch: Dispatch<Action>, getState: GetState) => {
    dispatch(playgroundActionCreator.loadProgramStarted(storageType, programId));

    await stay(2000);

    const programManagementService = resolveInject(ProgramManagementService);
    const programModel = await programManagementService.loadProgram(programId, storageType);

    dispatch(playgroundActionCreator.loadProgramCompleted(programModel, storageType, programId));
  };
}

export type PlaygroundAction = ActionType<typeof playgroundActionCreator>;

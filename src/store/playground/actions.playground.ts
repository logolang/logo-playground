import { Dispatch } from "react";
import { Action } from "redux";
import { action, ActionType } from "typesafe-actions";

import { resolve } from "utils/di";
import { normalizeError } from "utils/error";
import { Routes } from "ui/routes";
import { GetState } from "store/store";
import { envActionCreator } from "store/env/actions.env";
import { ProgramStorageType, ProgramModel } from "services/program.model";
import { ProgramService } from "services/program.service";
import { GalleryService } from "services/gallery.service";
import { NavigationService } from "services/navigation.service";
import { LocalPlaygroundCodeStorage } from "services/local-playground-code.storage";

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
  loadProgram: loadProgramThunk,

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

  codeChangedThunk: codeChangedThunk,
  codeChangedAction: (code: string) => action(PlaygroundActionType.CODE_CHANGED, { code }),

  runProgram: () => action(PlaygroundActionType.RUN_PROGRAM),
  stopProgram: () => action(PlaygroundActionType.STOP_PROGRAM),
  saveProgram: saveProgramThunk,
  saveAsProgram: saveAsProgramThunk,
  deleteProgram: deleteProgramThunk,

  syncProgramStarted: () => action(PlaygroundActionType.SYNC_PROGRAM_STARTED),

  syncProgramCompleted: (options: {
    newId?: string;
    newName?: string;
    newStorageType?: ProgramStorageType;
  }) => action(PlaygroundActionType.SYNC_PROGRAM_COMPLETED, options),

  syncProgramFailed: () => action(PlaygroundActionType.SYNC_PROGRAM_FAILED),

  clearProgram: () => action(PlaygroundActionType.RESET_STATE),
  revertChanges: revertChangesThunk
};

export type PlaygroundAction = ActionType<typeof playgroundActionCreator>;

function loadProgramThunk(storageType: ProgramStorageType, programId: string) {
  return async (dispatch: Dispatch<Action>, getState: GetState) => {
    const state = getState().playground;
    if (state.storageType === storageType && state.programId === programId) {
      // No need to load program because it is already loaded
      return;
    }
    dispatch(playgroundActionCreator.loadProgramStarted(storageType, programId));

    try {
      const programManagementService = resolve(ProgramService);
      const programModel = await programManagementService.loadProgram(storageType, programId);
      dispatch(playgroundActionCreator.loadProgramCompleted(programModel, storageType, programId));
    } catch (error) {
      const errDef = await normalizeError(error);
      dispatch(envActionCreator.handleError(errDef));
      NavigationService.navigate(Routes.gallery.build({}));
    }
  };
}

function saveAsProgramThunk(newName: string, screenShot: string) {
  return async (dispatch: Dispatch<Action>, getState: GetState) => {
    dispatch(playgroundActionCreator.syncProgramStarted());

    try {
      const state = getState().playground;
      const programService = resolve(ProgramService);

      const newProgram = await programService.saveProgramToLibrary({
        newProgramName: newName,
        newScreenshot: screenShot,
        newCode: state.code
      });

      dispatch(
        playgroundActionCreator.syncProgramCompleted({
          newId: newProgram.id,
          newName: newName,
          newStorageType: newProgram.storageType
        })
      );

      NavigationService.navigate(
        Routes.playground.build({
          storageType: newProgram.storageType,
          id: newProgram.id
        })
      );
    } catch (error) {
      const errDef = await normalizeError(error);
      dispatch(envActionCreator.handleError(errDef));
      dispatch(playgroundActionCreator.syncProgramFailed());
    }
  };
}

function saveProgramThunk(screenShot: string) {
  return async (dispatch: Dispatch<Action>, getState: GetState) => {
    dispatch(playgroundActionCreator.syncProgramStarted());
    const state = getState().playground;
    try {
      const programService = resolve(ProgramService);
      await programService.saveProgramToLibrary({
        id: state.programId,
        newProgramName: state.programName,
        newScreenshot: screenShot,
        newCode: state.code
      });
      dispatch(playgroundActionCreator.syncProgramCompleted({}));
    } catch (error) {
      const errDef = await normalizeError(error);
      dispatch(envActionCreator.handleError(errDef));
      dispatch(playgroundActionCreator.syncProgramFailed());
    }
  };
}

function deleteProgramThunk() {
  return async (dispatch: Dispatch<Action>, getState: GetState) => {
    const state = getState().playground;
    if (state.programId) {
      try {
        dispatch(playgroundActionCreator.syncProgramStarted());
        const galleryService = resolve(GalleryService);
        await galleryService.remove(state.programId);
        NavigationService.navigate(Routes.gallery.build({}));
      } catch (error) {
        const errDef = await normalizeError(error);
        dispatch(envActionCreator.handleError(errDef));
        dispatch(playgroundActionCreator.syncProgramFailed());
      }
    }
  };
}

function codeChangedThunk(newCode: string) {
  return async (dispatch: Dispatch<Action>, getState: GetState) => {
    dispatch(playgroundActionCreator.codeChangedAction(newCode));

    const localStorage = resolve(LocalPlaygroundCodeStorage);
    localStorage.setCode(newCode);
  };
}

function revertChangesThunk() {
  return async (dispatch: Dispatch<Action>, getState: GetState) => {
    const state = getState().playground;
    const { storageType, programId } = state;
    dispatch(playgroundActionCreator.syncProgramStarted());
    try {
      const programManagementService = resolve(ProgramService);
      const programModel = await programManagementService.loadProgram(storageType, programId);
      dispatch(playgroundActionCreator.loadProgramCompleted(programModel, storageType, programId));
    } catch (error) {
      const errDef = await normalizeError(error);
      dispatch(envActionCreator.handleError(errDef));
      dispatch(playgroundActionCreator.syncProgramFailed());
    }
  };
}

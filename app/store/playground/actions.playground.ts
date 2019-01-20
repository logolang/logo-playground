import { Dispatch } from "react";
import { Action } from "redux";
import { action, ActionType } from "typesafe-actions";

import { resolveInject } from "app/di";
import { GetState } from "app/store/store";
import { ProgramStorageType, ProgramModel } from "app/services/program/program.model";
import { stay } from "app/utils/async-helpers";
import { ProgramService } from "app/services/program/program.service";
import { PersonalGalleryService } from "app/services/gallery/personal-gallery.service";
import { NavigationService } from "app/services/infrastructure/navigation.service";
import { Routes } from "app/routes";

export enum PlaygroundActionType {
  LOAD_PROGRAM_STARTED = "LOAD_PROGRAM_STARTED",
  LOAD_PROGRAM_COMPLETED = "LOAD_PROGRAM_COMPLETED",
  CODE_CHANGED = "CODE_CHANGED",
  RUN_PROGRAM = "RUN_PROGRAM",
  STOP_PROGRAM = "STOP_PROGRAM",
  SYNC_PROGRAM_STARTED = "SYNC_PROGRAM_STARTED",
  SYNC_PROGRAM_COMPLETED = "SYNC_PROGRAM_COMPLETED"
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
  stopProgram: () => action(PlaygroundActionType.STOP_PROGRAM),
  saveProgram: saveProgramThunk,
  saveAsProgram: saveAsProgramThunk,
  deleteProgram: deleteProgramThunk,
  syncProgramStarted: () => action(PlaygroundActionType.SYNC_PROGRAM_STARTED),

  syncProgramCompleted: (options: { newId?: string; newName?: string; newStorageType?: ProgramStorageType }) =>
    action(PlaygroundActionType.SYNC_PROGRAM_COMPLETED, options)
};

function loadProgramThunk(storageType?: ProgramStorageType, programId?: string) {
  return async (dispatch: Dispatch<Action>, getState: GetState) => {
    const state = getState().playground;
    if (state.storageType === storageType && state.programId === programId) {
      // No need to load program because it is already loaded
      return;
    }
    dispatch(playgroundActionCreator.loadProgramStarted(storageType, programId));

    await stay(2000);

    const programManagementService = resolveInject(ProgramService);
    const programModel = await programManagementService.loadProgram(programId, storageType);

    dispatch(playgroundActionCreator.loadProgramCompleted(programModel, storageType, programId));
  };
}

function saveAsProgramThunk(newName: string, screenShot: string) {
  return async (dispatch: Dispatch<Action>, getState: GetState) => {
    dispatch(playgroundActionCreator.syncProgramStarted());
    const state = getState().playground;
    const programService = resolveInject(ProgramService);

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

    await stay(200);

    const navService = resolveInject(NavigationService);
    navService.navigate({
      route: Routes.playground.build({
        storageType: newProgram.storageType,
        id: newProgram.id
      })
    });
  };
}

function saveProgramThunk(screenShot: string) {
  return async (dispatch: Dispatch<Action>, getState: GetState) => {
    dispatch(playgroundActionCreator.syncProgramStarted());
    const state = getState().playground;
    const programService = resolveInject(ProgramService);
    await programService.saveProgramToLibrary({
      id: state.programId,
      newProgramName: state.programName,
      newScreenshot: screenShot,
      newCode: state.code
    });
    dispatch(playgroundActionCreator.syncProgramCompleted({}));
  };
}

function deleteProgramThunk() {
  return async (dispatch: Dispatch<Action>, getState: GetState) => {
    const state = getState().playground;
    if (state.programId) {
      dispatch(playgroundActionCreator.syncProgramStarted());
      const galleryService = resolveInject(PersonalGalleryService);
      await galleryService.remove(state.programId);
      const navService = resolveInject(NavigationService);
      navService.navigate({ route: Routes.gallery.build({}) });
    }
  };
}

export type PlaygroundAction = ActionType<typeof playgroundActionCreator>;

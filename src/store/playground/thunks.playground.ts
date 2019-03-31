import { Dispatch } from "react";
import { Action } from "redux";

import { resolve } from "utils/di";
import { normalizeError } from "utils/error";
import { Routes } from "ui/routes";
import { GetState } from "store/store";
import { envActionCreator } from "store/env/actions.env";
import { ProgramStorageType } from "services/program.model";
import { ProgramService } from "services/program.service";
import { GalleryService } from "services/gallery.service";
import { NavigationService } from "services/navigation.service";
import { LocalPlaygroundCodeStorage } from "services/local-playground-code.storage";
import { playgroundActionCreator } from "./actions.playground";
import {
  EventsTrackingService,
  EventAction
} from "services/infrastructure/events-tracking.service";
import { formatLogoProgram } from "ui/_generic/logo-executor/logo-formatter";

export const playgroundThunks = {
  loadProgram: loadProgramThunk,
  codeChanged: codeChangedThunk,
  saveProgram: saveProgramThunk,
  saveAsProgram: saveAsProgramThunk,
  deleteProgram: deleteProgramThunk,
  revertChanges: revertChangesThunk,
  formatCode: formatCodeThunk
};

function loadProgramThunk(storageType: ProgramStorageType, programId: string) {
  return async (dispatch: Dispatch<Action>, getState: GetState) => {
    const state = getState().playground;
    if (state.storageType === storageType && state.programId === programId) {
      // No need to load program because it is already loaded
      return;
    }

    const eventsTracker = resolve(EventsTrackingService);
    switch (storageType) {
      case ProgramStorageType.playground:
        eventsTracker.sendEvent(EventAction.openPlayground);
        break;
      case ProgramStorageType.gallery:
        eventsTracker.sendEvent(EventAction.openProgramFromLibrary);
        break;
      case ProgramStorageType.samples:
        eventsTracker.sendEvent(EventAction.openProgramFromSample);
        break;
      case ProgramStorageType.shared:
        eventsTracker.sendEvent(EventAction.openProgramFromShare);
        break;
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

    const eventsTracker = resolve(EventsTrackingService);
    eventsTracker.sendEvent(EventAction.saveProgramToPersonalLibrary);

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

    const eventsTracker = resolve(EventsTrackingService);
    eventsTracker.sendEvent(EventAction.saveProgramToPersonalLibrary);

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

    const eventsTracker = resolve(EventsTrackingService);
    eventsTracker.sendEvent(EventAction.revertProgramChanges);

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

function formatCodeThunk() {
  return async (dispatch: Dispatch<any>, getState: GetState) => {
    const code = getState().playground.code;
    const formatted = formatLogoProgram(code);
    dispatch(playgroundThunks.codeChanged(formatted));
  };
}

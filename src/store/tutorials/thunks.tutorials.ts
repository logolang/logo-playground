import { Dispatch } from "react";

import { $T } from "i18n-strings";
import { resolve } from "utils/di";
import { normalizeError } from "utils/error";
import { GetState } from "store/store";
import { envActionCreator } from "store/env/actions.env";
import { TutorialsService } from "services/tutorials-service";
import { tutorialsActionCreator } from "./actions.tutorials";
import { formatLogoProgram } from "ui/_generic/logo-executor/logo-formatter";
import { ProgramService } from "services/program.service";
import { NotificationType } from "store/env/state.env";
import { envThunks } from "store/env/thunks.env";
import {
  EventsTrackingService,
  EventAction
} from "services/infrastructure/events-tracking.service";

export const tutorialsThunks = {
  loadStep: loadStepThunk,
  formatCode: formatCodeThunk,
  saveAsProgram: saveAsProgramThunk
};

function loadStepThunk(tutorialId: string, stepId: string) {
  return async (dispatch: Dispatch<any>, getState: GetState) => {
    const tutorialsLoader = resolve(TutorialsService);
    let tutorials = getState().tutorials.tutorials;

    if (!tutorials) {
      dispatch(tutorialsActionCreator.loadTutorialsStarted());
      try {
        tutorials = await tutorialsLoader.getTutorialsList();
        dispatch(tutorialsActionCreator.loadTutorialsCompleted(tutorials));
      } catch (error) {
        const errDef = await normalizeError(error);
        dispatch(envActionCreator.handleError(errDef));
        throw new Error("Fail to load tutorials");
      }
    }

    if (!tutorialId || !stepId) {
      const lastStep = tutorialsLoader.getLastStep();
      tutorialId = lastStep.tutorialId;
      stepId = lastStep.stepId;
    }

    dispatch(tutorialsActionCreator.loadStepStarted(tutorialId, stepId));
    try {
      const tutorialInfo = tutorials.find(t => t.id === tutorialId);
      const stepInfo = tutorialInfo && tutorialInfo.steps.find(s => s.id === stepId);
      if (!tutorialInfo || !stepInfo) {
        tutorialsLoader.setLastStep(tutorialsLoader.defaultStep);
        throw new Error("Tutorial is not found, please refresh the page to load the default one.");
      }

      const stepContent = await tutorialsLoader.getStep(tutorialId, stepId);

      dispatch(
        tutorialsActionCreator.loadStepCompleted(
          tutorialId,
          stepId,
          tutorialInfo,
          stepInfo,
          stepContent
        )
      );
    } catch (error) {
      const errDef = await normalizeError(error);
      dispatch(envActionCreator.handleError(errDef));
    }
  };
}

function formatCodeThunk() {
  return async (dispatch: Dispatch<any>, getState: GetState) => {
    const code = getState().tutorials.code;
    const formatted = formatLogoProgram(code);
    dispatch(tutorialsActionCreator.codeChanged(formatted));
  };
}

function saveAsProgramThunk(newName: string, screenShot: string) {
  return async (dispatch: Dispatch<any>, getState: GetState) => {
    const eventsTracker = resolve(EventsTrackingService);
    eventsTracker.sendEvent(EventAction.saveProgramToPersonalLibrary);

    try {
      const state = getState().tutorials;
      const programService = resolve(ProgramService);

      await programService.saveProgramToLibrary({
        newProgramName: newName,
        newScreenshot: screenShot,
        newCode: state.code
      });

      dispatch(
        envThunks.showNotificationAutoClose(
          NotificationType.info,
          $T.common.appTitle,
          $T.program.programSavedToLibrarySuccess
        )
      );
    } catch (error) {
      const errDef = await normalizeError(error);
      dispatch(envActionCreator.handleError(errDef));
    }
  };
}

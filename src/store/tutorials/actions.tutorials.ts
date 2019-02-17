import { Dispatch } from "react";
import { Action } from "redux";
import { action, ActionType } from "typesafe-actions";

import { resolve } from "utils/di";
import { normalizeError } from "utils/error";
import { GetState } from "store/store";
import { envActionCreator } from "store/env/actions.env";
import {
  TutorialInfo,
  TutorialStepContent,
  TutorialStepInfo,
  TutorialsContentService
} from "services/tutorials-content-service";

export enum TutorialsActionType {
  LOAD_TUTORIALS_STARTED = "LOAD_TUTORIALS_STARTED",
  LOAD_TUTORIALS_COMPLETED = "LOAD_TUTORIALS_COMPLETED",
  LOAD_STEP_STARTED = "LOAD_STEP_STARTED",
  LOAD_STEP_COMPLETED = "LOAD_STEP_COMPLETED",
  CODE_CHANGED = "TUTORIALS_CODE_CHANGED",
  RUN_PROGRAM = "TUTORIALS_RUN_PROGRAM",
  STOP_PROGRAM = "TUTORIALS_STOP_PROGRAM",
  FIX_THE_CODE = "FIX_THE_CODE"
}

export const tutorialsActionCreator = {
  loadTutorials: loadTutorialsThunk,

  loadTutorialsStarted: () => action(TutorialsActionType.LOAD_TUTORIALS_STARTED),

  loadTutorialsCompleted: (tutorials: TutorialInfo[]) =>
    action(TutorialsActionType.LOAD_TUTORIALS_COMPLETED, { tutorials }),

  loadStep: loadStepThunk,

  loadStepStarted: (tutorialId: string, stepId: string) =>
    action(TutorialsActionType.LOAD_STEP_STARTED, { tutorialId, stepId }),

  loadStepCompleted: (
    tutorialId: string,
    stepId: string,
    tutorialInfo: TutorialInfo,
    stepInfo: TutorialStepInfo,
    content: TutorialStepContent
  ) =>
    action(TutorialsActionType.LOAD_STEP_COMPLETED, {
      tutorialId,
      stepId,
      tutorialInfo,
      stepInfo,
      content
    }),

  codeChanged: (code: string) => action(TutorialsActionType.CODE_CHANGED, { code }),

  runProgram: () => action(TutorialsActionType.RUN_PROGRAM),

  stopProgram: () => action(TutorialsActionType.STOP_PROGRAM),

  fixTheCode: () => action(TutorialsActionType.FIX_THE_CODE)
};

export type TutorialsAction = ActionType<typeof tutorialsActionCreator>;

function loadTutorialsThunk() {
  return async (dispatch: Dispatch<Action>, getState: GetState) => {
    dispatch(tutorialsActionCreator.loadTutorialsStarted());
    try {
      const tutorialsLoader = resolve(TutorialsContentService);
      const tutorials = await tutorialsLoader.getTutorialsList();
      dispatch(tutorialsActionCreator.loadTutorialsCompleted(tutorials));
    } catch (error) {
      const errDef = await normalizeError(error);
      dispatch(envActionCreator.handleError(errDef));
    }
  };
}

function loadStepThunk(tutorialId: string, stepId: string) {
  return async (dispatch: Dispatch<Action>, getState: GetState) => {
    let tutorials = getState().tutorials.tutorials;
    if (!tutorials) {
      await tutorialsActionCreator.loadTutorials()(dispatch, getState);
    }
    tutorials = getState().tutorials.tutorials;
    if (!tutorials) {
      throw new Error("Tutorials are still not initialized?");
    }

    dispatch(tutorialsActionCreator.loadStepStarted(tutorialId, stepId));
    try {
      const tutorialsLoader = resolve(TutorialsContentService);
      const stepContent = await tutorialsLoader.getStep(tutorialId, stepId);
      const tutorialInfo = tutorials.find(t => t.id === tutorialId);
      if (!tutorialInfo) {
        throw new Error("Tutorial is not found: " + tutorialId);
      }
      const stepInfo = tutorialInfo.steps.find(s => s.id === stepId);
      if (!stepInfo) {
        throw new Error("Step is not found: " + stepId);
      }

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

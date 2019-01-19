import { Dispatch } from "react";
import { Action } from "redux";
import { action, ActionType } from "typesafe-actions";

import { resolveInject } from "app/di";
import { GetState } from "app/store/store";
import { stay } from "app/utils/async-helpers";
import {
  ITutorialInfo,
  ITutorialStepContent,
  ITutorialStepInfo,
  TutorialsContentService
} from "app/services/tutorials/tutorials-content-service";

export enum TutorialsActionType {
  LOAD_TUTORIALS_STARTED = "LOAD_TUTORIALS_STARTED",
  LOAD_TUTORIALS_COMPLETED = "LOAD_TUTORIALS_COMPLETED",
  LOAD_STEP_STARTED = "LOAD_STEP_STARTED",
  LOAD_STEP_COMPLETED = "LOAD_STEP_COMPLETED",
  CODE_CHANGED = "CODE_CHANGED",
  RUN_PROGRAM = "RUN_PROGRAM",
  STOP_PROGRAM = "STOP_PROGRAM",
  FIX_THE_CODE = "FIX_THE_CODE"
}

export const tutorialsActionCreator = {
  loadTutorials: loadTutorialsThunk,

  loadTutorialsStarted: () => action(TutorialsActionType.LOAD_TUTORIALS_STARTED),

  loadTutorialsCompleted: (tutorials: ITutorialInfo[]) =>
    action(TutorialsActionType.LOAD_TUTORIALS_COMPLETED, { tutorials }),

  loadStep: loadStepThunk,

  loadStepStarted: (tutorialId: string, stepId: string) =>
    action(TutorialsActionType.LOAD_STEP_STARTED, { tutorialId, stepId }),

  loadStepCompleted: (
    tutorialId: string,
    stepId: string,
    tutorialInfo: ITutorialInfo,
    stepInfo: ITutorialStepInfo,
    content: ITutorialStepContent
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

function loadTutorialsThunk() {
  return async (dispatch: Dispatch<Action>, getState: GetState) => {
    dispatch(tutorialsActionCreator.loadTutorialsStarted());

    const tutorialsLoader = resolveInject(TutorialsContentService);
    const tutorials = await tutorialsLoader.getTutorialsList();

    //TODO
    await stay(1000);

    dispatch(tutorialsActionCreator.loadTutorialsCompleted(tutorials));
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
      throw new Error("Tutorials are stillnot initialized?");
    }

    dispatch(tutorialsActionCreator.loadStepStarted(tutorialId, stepId));

    const tutorialsLoader = resolveInject(TutorialsContentService);
    const stepContent = await tutorialsLoader.getStep(tutorialId, stepId);
    const tutorialInfo = tutorials.find(t => t.id === tutorialId);
    if (!tutorialInfo) {
      throw new Error("Tutorial is not found: " + tutorialId);
    }
    const stepInfo = tutorialInfo.steps.find(s => s.id === stepId);
    if (!stepInfo) {
      throw new Error("Step is not found: " + stepId);
    }
    //TODO
    await stay(1000);

    dispatch(tutorialsActionCreator.loadStepCompleted(tutorialId, stepId, tutorialInfo, stepInfo, stepContent));
  };
}

export type TutorialsAction = ActionType<typeof tutorialsActionCreator>;

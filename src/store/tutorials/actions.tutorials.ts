import { action, ActionType } from "typesafe-actions";

import { TutorialInfo, TutorialStepContent, TutorialStepInfo } from "services/tutorials-service";

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
  loadTutorialsStarted: () => action(TutorialsActionType.LOAD_TUTORIALS_STARTED),

  loadTutorialsCompleted: (tutorials: TutorialInfo[]) =>
    action(TutorialsActionType.LOAD_TUTORIALS_COMPLETED, { tutorials }),

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

import { Dispatch } from "react";
import { Action } from "redux";
import { ActionType } from "typesafe-actions";

import { resolve } from "utils/di";
import { normalizeError } from "utils/error";
import { GetState } from "store/store";
import { envActionCreator } from "store/env/actions.env";
import { TutorialsService } from "services/tutorials-service";
import { tutorialsActionCreator } from "./actions.tutorials";

export const tutorialsThunks = {
  loadStep: loadStepThunk
};

function loadStepThunk(tutorialId: string, stepId: string) {
  return async (dispatch: Dispatch<any>, getState: GetState) => {
    let tutorials = getState().tutorials.tutorials;
    if (!tutorials) {
      dispatch(tutorialsActionCreator.loadTutorialsStarted());
      try {
        const tutorialsLoader = resolve(TutorialsService);
        tutorials = await tutorialsLoader.getTutorialsList();
        dispatch(tutorialsActionCreator.loadTutorialsCompleted(tutorials));
      } catch (error) {
        const errDef = await normalizeError(error);
        dispatch(envActionCreator.handleError(errDef));
        throw new Error("Fail to load tutorials");
      }
    }

    dispatch(tutorialsActionCreator.loadStepStarted(tutorialId, stepId));
    try {
      const tutorialsLoader = resolve(TutorialsService);
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

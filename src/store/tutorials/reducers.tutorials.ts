import { TutorialsState, defaultTutorialsState } from "./state.tutorials";
import { TutorialsActionType, TutorialsAction } from "./actions.tutorials";

export default function reducers(
  state: TutorialsState | undefined,
  action: TutorialsAction
): TutorialsState {
  if (!state || !action) {
    return defaultTutorialsState;
  }
  switch (action.type) {
    case TutorialsActionType.LOAD_TUTORIALS_STARTED:
      return {
        ...state,
        isLoading: true
      };
    case TutorialsActionType.LOAD_TUTORIALS_COMPLETED:
      return {
        ...state,
        isLoading: false,
        tutorials: action.payload.tutorials
      };
    case TutorialsActionType.LOAD_STEP_STARTED:
      return {
        ...state,
        isStepLoading: true,
        tutorialId: action.payload.tutorialId,
        stepId: action.payload.stepId
      };
    case TutorialsActionType.LOAD_STEP_COMPLETED:
      return {
        ...state,
        isStepLoading: false,
        currentTutorialInfo: action.payload.tutorialInfo,
        currentStepInfo: action.payload.stepInfo,
        currentStepContent: action.payload.content,
        isRunning: true
      };
    case TutorialsActionType.CODE_CHANGED:
      return {
        ...state,
        code: action.payload.code
      };
    case TutorialsActionType.RUN_PROGRAM:
      return {
        ...state,
        isRunning: true
      };
    case TutorialsActionType.STOP_PROGRAM:
      return {
        ...state,
        isRunning: false
      };
    case TutorialsActionType.FIX_THE_CODE:
      if (state.currentStepContent) {
        return {
          ...state,
          code: state.currentStepContent.solutionCode,
          isRunning: true
        };
      }
      return state;
    default:
      return state;
  }
}

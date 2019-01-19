import { TutorialsState } from "./state.tutorials";
import { TutorialsActionType, TutorialsAction } from "./actions.tutorials";

export function reducers(state: TutorialsState | undefined, action: TutorialsAction): TutorialsState {
  if (!state) {
    return null as any; // This effectively skips initial state because that is defined in the store initialization
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
        currentStepContent: action.payload.content
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
          isRunning: false,
          code: state.currentStepContent.resultCode
        };
      }
      return state;
    default:
      return state;
  }
}

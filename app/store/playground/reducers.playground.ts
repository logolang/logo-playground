import { PlaygroundState } from "./state.playground";
import { PlaygroundAction, PlaygroundActionType } from "./actions.playground";

export function reducers(state: PlaygroundState | undefined, action: PlaygroundAction): PlaygroundState {
  if (!state) {
    return null as any; // This effectively skips initial state because that is defined in the store initialization
  }
  switch (action.type) {
    case PlaygroundActionType.LOAD_PROGRAM_STARTED:
      return {
        ...state,
        isLoading: true,
        storageType: action.payload.storageType,
        programId: action.payload.programId,
        programName: "Loading...",
        isRunning: false,
        hasModifications: false
      };
    case PlaygroundActionType.LOAD_PROGRAM_COMPLETED:
      if (action.payload.storageType === state.storageType && action.payload.programId === state.programId) {
        return {
          ...state,
          isLoading: false,
          programName: action.payload.programModel.name,
          code: action.payload.programModel.code,
          isRunning: true,
          hasModifications: false
        };
      }
      return state;
    case PlaygroundActionType.CODE_CHANGED:
      return {
        ...state,
        code: action.payload.code,
        hasModifications: true
      };
    case PlaygroundActionType.RUN_PROGRAM:
      return {
        ...state,
        isRunning: true
      };
    case PlaygroundActionType.STOP_PROGRAM:
      return {
        ...state,
        isRunning: false
      };
    default:
      return state;
  }
}

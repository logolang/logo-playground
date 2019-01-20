import { PlaygroundState, defaultPlaygroundState } from "./state.playground";
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
    case PlaygroundActionType.SYNC_PROGRAM_STARTED:
      return {
        ...state,
        isLoading: true
      };
    case PlaygroundActionType.SYNC_PROGRAM_COMPLETED: {
      const newState = {
        ...state,
        isLoading: false,
        hasModifications: false
      };
      if (action.payload.newId) {
        newState.programId = action.payload.newId;
      }
      if (action.payload.newStorageType) {
        newState.storageType = action.payload.newStorageType;
      }
      if (action.payload.newName) {
        newState.programName = action.payload.newName;
      }
      return newState;
    }

    case PlaygroundActionType.RESET_STATE: {
      return {
        ...defaultPlaygroundState
      };
    }

    default:
      return state;
  }
}

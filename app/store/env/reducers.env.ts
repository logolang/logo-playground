import { EnvState, defaultEnvState, anonymousUser } from "./state.env";
import { EnvAction, EnvActionType } from "./actions.env";

export function reducers(state: EnvState | undefined, action: EnvAction): EnvState {
  if (!state || !action) {
    return defaultEnvState;
  }
  switch (action.type) {
    case EnvActionType.INIT_ENV_STARTED:
      return {
        ...state,
        isLoading: true,
        user: anonymousUser
      };
    case EnvActionType.SIGN_IN_COMPLETED:
      return {
        ...state,
        isLoading: false,
        user: action.payload
      };
    case EnvActionType.APPLY_USER_SETTINGS:
      return {
        ...state,
        userSettings: action.payload
      };
    default:
      return state;
  }
}

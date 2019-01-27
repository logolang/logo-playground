import { EnvState, defaultEnvState } from "./state.env";
import { EnvAction, EnvActionType } from "./actions.env";
import { anonymousUser } from "app/services/env/auth-service";

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
    case EnvActionType.APPLY_USER_SETTINGS_COMPLETED:
      return {
        ...state,
        userSettings: {
          ...state.userSettings,
          ...action.payload
        }
      };
    default:
      return state;
  }
}

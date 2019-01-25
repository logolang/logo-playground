import { EnvState, defaultEnvState } from "./state.env";
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
        isLoggedIn: false
      };
    case EnvActionType.SIGN_IN_COMPLETED:
      return {
        ...state,
        isLoading: false,
        isLoggedIn: true,
        name: action.payload.name,
        id: action.payload.id,
        email: action.payload.email,
        imageUrl: action.payload.imageUrl,
        authProvider: action.payload.authProvider
      };

    default:
      return state;
  }
}

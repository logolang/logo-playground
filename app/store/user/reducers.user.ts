import { UserState, defaultUserState } from "./state.user";
import { UserAction, UserActionType } from "./actions.user";

export function reducers(state: UserState | undefined, action: UserAction): UserState {
  if (!state || !action) {
    return defaultUserState;
  }
  switch (action.type) {
    case UserActionType.LOAD_USER_STARTED:
      return {
        ...state,
        isLoading: true,
        isLoggedIn: false
      };
    case UserActionType.LOAD_USER_COMPLETED:
      return {
        ...state,
        isLoading: false,
        isLoggedIn: true
      };

    default:
      return state;
  }
}

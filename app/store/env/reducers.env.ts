import { EnvState, defaultEnvState } from "./state.env";
import { EnvAction, EnvActionType } from "./actions.env";
import { anonymousUser } from "app/services/env/auth-service";
import { NotificationType } from "./state.env";

let incrementalId: number = 0;

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
    case EnvActionType.ERROR:
      return {
        ...state,
        notifications: [
          ...state.notifications,
          {
            id: (++incrementalId).toString(),
            type: NotificationType.danger,
            title: "Error",
            message: action.payload.errDef.message
          }
        ]
      };
    case EnvActionType.SHOW_NOTIFICATION:
      return {
        ...state,
        notifications: [
          {
            id: (++incrementalId).toString(),
            type: action.payload.type,
            title: action.payload.title,
            message: action.payload.message
          },
          ...state.notifications
        ]
      };
    case EnvActionType.CLOSE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(x => x.id !== action.payload.id)
      };
    default:
      return state;
  }
}

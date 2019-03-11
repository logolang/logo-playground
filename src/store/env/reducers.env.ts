import { EnvState, defaultEnvState, NotificationType } from "./state.env";
import { EnvAction, EnvActionType } from "./actions.env";
import { anonymousUser } from "services/infrastructure/auth-service";
import { $T } from "i18n-strings";
import { themesManager } from "ui/themes-helper";

let incrementalId = 0;

export default function reducers(state: EnvState | undefined, action: EnvAction): EnvState {
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
      const theme = themesManager.getThemeByName(action.payload.themeName);
      return {
        ...state,
        userSettings: {
          ...state.userSettings,
          ...action.payload
        },
        appTheme: { ...theme }
      };
    case EnvActionType.ERROR:
      return {
        ...state,
        notifications: [
          ...state.notifications,
          {
            id: (++incrementalId).toString(),
            type: NotificationType.danger,
            title: $T.common.error,
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

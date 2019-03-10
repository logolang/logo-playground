import { action, ActionType } from "typesafe-actions";
import { UserSettings } from "services/user-settings";
import { UserData } from "services/infrastructure/auth-service";
import { ErrorDef } from "utils/error";
import { NotificationType } from "./state.env";

export enum EnvActionType {
  INIT_ENV_STARTED = "INIT_ENV_STARTED",
  SIGN_IN_COMPLETED = "SIGN_IN_COMPLETED",
  SIGN_OUT_COMPLETED = "SIGN_OUT_COMPLETED",
  APPLY_USER_SETTINGS_COMPLETED = "APPLY_USER_SETTINGS_COMPLETED",
  ERROR = "ERROR",
  SHOW_NOTIFICATION = "SHOW_NOTIFICATION",
  CLOSE_NOTIFICATION = "CLOSE_NOTIFICATION"
}

export const envActionCreator = {
  initEnvStarted: () => action(EnvActionType.INIT_ENV_STARTED),

  signInCompleted: (userData: UserData) => action(EnvActionType.SIGN_IN_COMPLETED, userData),

  applyUserSettingsCompleted: (settings: Partial<UserSettings>) =>
    action(EnvActionType.APPLY_USER_SETTINGS_COMPLETED, settings),

  handleError: (errDef: ErrorDef) => action(EnvActionType.ERROR, { errDef }),

  showNotification: (type: NotificationType, title: string, message: string) =>
    action(EnvActionType.SHOW_NOTIFICATION, { type, title, message }),

  closeNotification: (id: string) => action(EnvActionType.CLOSE_NOTIFICATION, { id })
};

export type EnvAction = ActionType<typeof envActionCreator>;

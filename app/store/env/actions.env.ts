import { Dispatch } from "react";
import { Action } from "redux";
import { action, ActionType } from "typesafe-actions";
import { GetState } from "app/store/store";
import { DISetup } from "app/di-setup";
import { resolve } from "app/di";
import { UserSettingsService } from "app/services/env/user-settings.service";
import { UserSettings } from "app/services/env/user-settings";
import { AuthService, UserData, AuthProvider } from "app/services/env/auth-service";
import { ErrorDef } from "app/utils/error";
import { NotificationType } from "./state.env";
import { loadConfig } from "app/services/env/app-config";

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
  initEnv: initEnvThunk,

  initEnvStarted: () => action(EnvActionType.INIT_ENV_STARTED),

  signInCompleted: (userData: UserData) => action(EnvActionType.SIGN_IN_COMPLETED, userData),

  signIn: signInThunk,

  signOut: signOutThunk,

  applyUserSettingsCompleted: (settings: Partial<UserSettings>) =>
    action(EnvActionType.APPLY_USER_SETTINGS_COMPLETED, settings),

  applyUserSettings: applyUserSettingsThunk,

  handleError: (errDef: ErrorDef) => action(EnvActionType.ERROR, { errDef }),

  showNotification: (type: NotificationType, title: string, message: string) =>
    action(EnvActionType.SHOW_NOTIFICATION, { type, title, message }),

  showNotificationAutoClose: showNotificationAutoCloseThunk,

  closeNotification: (id: string) => action(EnvActionType.CLOSE_NOTIFICATION, { id })
};

export type EnvAction = ActionType<typeof envActionCreator>;

function initEnvThunk() {
  return async (dispatch: Dispatch<Action>, getState: GetState) => {
    dispatch(envActionCreator.initEnvStarted());
    const appConfig = await loadConfig();
    const initInfo = await DISetup.setup({ appConfig });

    dispatch(envActionCreator.applyUserSettingsCompleted(initInfo.userSettings));
    dispatch(envActionCreator.signInCompleted(initInfo.user));
  };
}

function signInThunk(authProvider: AuthProvider) {
  return async (dispatch: Dispatch<any>, getState: GetState) => {
    const auth = resolve(AuthService);
    await auth.signIn(authProvider);
    dispatch(envActionCreator.initEnv());
  };
}

function signOutThunk() {
  return async (dispatch: Dispatch<any>, getState: GetState) => {
    const auth = resolve(AuthService);
    await auth.signOut();
    dispatch(envActionCreator.initEnv());
  };
}

function applyUserSettingsThunk(
  settings: Partial<UserSettings>,
  options?: { rebindServices: boolean }
) {
  return async (dispatch: Dispatch<any>, getState: GetState) => {
    const settingsService = resolve(UserSettingsService);
    await settingsService.update(settings);
    if (options && options.rebindServices) {
      dispatch(envActionCreator.initEnv());
    } else {
      const newSettings = await settingsService.get();
      dispatch(envActionCreator.applyUserSettingsCompleted(newSettings));
    }
  };
}

function showNotificationAutoCloseThunk(type: NotificationType, title: string, message: string) {
  return async (dispatch: Dispatch<Action>, getState: GetState) => {
    dispatch(envActionCreator.showNotification(type, title, message));
    const lastmessageId = getState().env.notifications[0].id;
    setTimeout(() => {
      dispatch(envActionCreator.closeNotification(lastmessageId));
    }, 3000);
  };
}

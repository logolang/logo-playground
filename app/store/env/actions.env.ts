import { Dispatch } from "react";
import { Action } from "redux";
import { action, ActionType } from "typesafe-actions";
import { GetState } from "app/store/store";
import { DISetup } from "app/di-setup";
import { resolveInject } from "app/di";
import { AppConfig } from "app/services/env/app-config";
import { UserSettingsService } from "app/services/env/user-settings.service";
import { UserSettings } from "app/types/user-settings";
import { AuthService, UserData, AuthProvider } from "app/services/env/auth-service";

export enum EnvActionType {
  INIT_ENV_STARTED = "INIT_ENV_STARTED",
  SIGN_IN_COMPLETED = "SIGN_IN_COMPLETED",
  SIGN_OUT_COMPLETED = "SIGN_OUT_COMPLETED",
  APPLY_USER_SETTINGS_COMPLETED = "APPLY_USER_SETTINGS_COMPLETED"
}

export const envActionCreator = {
  initEnv: initEnvThunk,

  initEnvStarted: () => action(EnvActionType.INIT_ENV_STARTED),

  signInCompleted: (userData: UserData) => action(EnvActionType.SIGN_IN_COMPLETED, userData),

  signIn: signInThunk,

  signOut: signOutThunk,

  applyUserSettingsCompleted: (settings: Partial<UserSettings>) =>
    action(EnvActionType.APPLY_USER_SETTINGS_COMPLETED, settings),

  applyUserSettings: applyUserSettingsThunk
};

function initEnvThunk() {
  return async (dispatch: Dispatch<Action>, getState: GetState) => {
    dispatch(envActionCreator.initEnvStarted());

    await DISetup.setupConfig();
    const auth = resolveInject(AuthService);
    const userData = await auth.init();

    const settingsService = new UserSettingsService(userData.email);
    const settings = await settingsService.get();

    await DISetup.setup({ user: userData });

    dispatch(envActionCreator.applyUserSettingsCompleted(settings));
    dispatch(envActionCreator.signInCompleted(userData));
  };
}

function signInThunk(authProvider: AuthProvider) {
  return async (dispatch: Dispatch<Action>, getState: GetState) => {
    const auth = resolveInject(AuthService);
    await auth.signIn(authProvider);
    DISetup.reset();
    await initEnvThunk()(dispatch, getState);
  };
}

function signOutThunk() {
  return async (dispatch: Dispatch<Action>, getState: GetState) => {
    const auth = resolveInject(AuthService);
    await auth.signOut();
    DISetup.reset();
    await initEnvThunk()(dispatch, getState);
  };
}

function applyUserSettingsThunk(settings: Partial<UserSettings>) {
  return async (dispatch: Dispatch<Action>, getState: GetState) => {
    const state = getState();
    const settingsService = new UserSettingsService(state.env.user.email);
    await settingsService.update(settings);
    const newSettings = await settingsService.get();
    dispatch(envActionCreator.applyUserSettingsCompleted(newSettings));
  };
}

export type EnvAction = ActionType<typeof envActionCreator>;

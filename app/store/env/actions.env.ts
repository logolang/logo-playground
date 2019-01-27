import { Dispatch } from "react";
import { Action } from "redux";
import { action, ActionType } from "typesafe-actions";
import { GetState } from "app/store/store";
import { DISetup } from "app/di-setup";
import { AuthProvider, UserData, anonymousUser } from "./state.env";
import { GoogleAuthService } from "app/services/infrastructure/google-auth.service";
import { resolveInject } from "app/di";
import { AppConfig } from "app/services/env/app-config";
import { UserSettingsService } from "app/services/env/user-settings.service";
import { UserSettings } from "app/types/user-settings";

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
    const config = resolveInject(AppConfig);
    const ga = new GoogleAuthService(config.services.googleClientId);
    const user = await ga.init();
    console.log("user", user);
    const userData: UserData = user
      ? {
          isLoggedIn: true,
          id: user.id,
          name: user.name,
          email: user.email,
          imageUrl: user.imageUrl,
          authProvider: AuthProvider.google
        }
      : anonymousUser;

    const settingsService = new UserSettingsService(userData.email);
    const settings = await settingsService.get();

    await DISetup.setup({ user: userData });

    dispatch(envActionCreator.applyUserSettingsCompleted(settings));
    dispatch(envActionCreator.signInCompleted(userData));
  };
}

function signInThunk(authProvider: AuthProvider) {
  return async (dispatch: Dispatch<Action>, getState: GetState) => {
    console.error("Not implemented");
  };
}

function signOutThunk() {
  return async (dispatch: Dispatch<Action>, getState: GetState) => {
    console.error("Not implemented");
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

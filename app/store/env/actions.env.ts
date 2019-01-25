import { Dispatch } from "react";
import { Action } from "redux";
import { action, ActionType } from "typesafe-actions";
import { GetState } from "app/store/store";
import { DISetup } from "app/di-setup";
import { AuthProvider, UserData, anonymousUser } from "./state.env";
import { GoogleAuthService } from "app/services/infrastructure/google-auth.service";
import { resolveInject } from "app/di";
import { AppConfig } from "app/services/env/app-config";
import { UserSettings, UserSettingsService } from "app/services/env/user-settings.service";

export enum EnvActionType {
  INIT_ENV_STARTED = "INIT_ENV_STARTED",
  SIGN_IN_COMPLETED = "SIGN_IN_COMPLETED",
  SIGN_OUT_COMPLETED = "SIGN_OUT_COMPLETED",
  APPLY_USER_SETTINGS = "APPLY_USER_SETTINGS"
}

export const envActionCreator = {
  initEnv: initEnvThunk,

  initEnvStarted: () => action(EnvActionType.INIT_ENV_STARTED),

  signInCompleted: (userData: UserData) => action(EnvActionType.SIGN_IN_COMPLETED, userData),

  signIn: signInThunk,

  signOut: signOutThunk,

  applyUserSettings: (settings: UserSettings) => action(EnvActionType.APPLY_USER_SETTINGS, settings)
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

    dispatch(envActionCreator.applyUserSettings(settings));
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

export type EnvAction = ActionType<typeof envActionCreator>;

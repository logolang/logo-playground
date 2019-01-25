import { Dispatch } from "react";
import { Action } from "redux";
import { action, ActionType } from "typesafe-actions";
import { GetState } from "app/store/store";
import { DISetup } from "app/di-setup";
import { AuthProvider } from "./state.env";
import { GoogleAuthService } from "app/services/infrastructure/google-auth.service";
import { resolveInject } from "app/di";
import { AppConfig } from "app/services/env/app-config";

export enum EnvActionType {
  INIT_ENV_STARTED = "INIT_ENV_STARTED",
  SIGN_IN_COMPLETED = "SIGN_IN_COMPLETED",
  SIGN_OUT_COMPLETED = "SIGN_OUT_COMPLETED"
}

export const envActionCreator = {
  initEnv: initEnvThunk,

  initEnvStarted: () => action(EnvActionType.INIT_ENV_STARTED),

  signInCompleted: (userInfo: {
    name: string;
    id: string;
    email: string;
    imageUrl: string;
    authProvider: AuthProvider;
  }) => action(EnvActionType.SIGN_IN_COMPLETED, userInfo),

  signIn: signInThunk,

  signOut: signOutThunk
};

function initEnvThunk() {
  return async (dispatch: Dispatch<Action>, getState: GetState) => {
    dispatch(envActionCreator.initEnvStarted());

    await DISetup.setupConfig();
    const config = resolveInject(AppConfig);
    const ga = new GoogleAuthService(config.services.googleClientId);
    const user = await ga.init();
    console.log("user", user);
    //await stay(2000);

    const userData = {
      id: user ? user.id : "",
      name: user ? user.name : "",
      email: user ? user.email : "",
      imageUrl: user ? user.imageUrl : "",
      authProvider: user ? AuthProvider.google : AuthProvider.none
    };

    await DISetup.setup({
      userName: userData.name,
      userImage: userData.imageUrl,
      userEmail: userData.email,
      authProvider: userData.authProvider
    });

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

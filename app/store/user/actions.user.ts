import { Dispatch } from "react";
import { Action } from "redux";
import { action, ActionType } from "typesafe-actions";
import { GetState } from "app/store/store";
import { stay } from "app/utils/async-helpers";
import { DISetup } from "app/di-setup";
import { AuthProvider } from "./state.user";

export enum UserActionType {
  LOAD_USER_STARTED = "LOAD_USER_STARTED",
  LOAD_USER_COMPLETED = "LOAD_USER_COMPLETED"
}

export const userActionCreator = {
  loadUser: loadUserThunk,

  loadUserStarted: () => action(UserActionType.LOAD_USER_STARTED),

  loadUserCompleted: (userInfo: { name: string; id: string; email: string; imageUrl: string }) =>
    action(UserActionType.LOAD_USER_COMPLETED, userInfo),

  signIn: signInThunk,

  signOut: signOutThunk
};

function loadUserThunk() {
  return async (dispatch: Dispatch<Action>, getState: GetState) => {
    dispatch(userActionCreator.loadUserStarted());
    await stay(2000);

    const userData = {
      id: "1",
      name: "olek",
      email: "olek@",
      imageUrl: "",
      authProvider: AuthProvider.google
    };

    await DISetup.setup({
      userName: userData.name,
      userImage: userData.imageUrl,
      userEmail: userData.email,
      authProvider: userData.authProvider
    });

    dispatch(userActionCreator.loadUserCompleted(userData));
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

export type UserAction = ActionType<typeof userActionCreator>;

import { Dispatch } from "react";
import { Action } from "redux";
import { action, ActionType } from "typesafe-actions";

import { resolveInject } from "app/di";
import { GetState } from "app/store/store";
import { stay } from "app/utils/async-helpers";

export enum UserActionType {
  LOAD_USER_STARTED = "LOAD_USER_STARTED",
  LOAD_USER_COMPLETED = "LOAD_USER_COMPLETED"
}

export const userActionCreator = {
  loadUser: loadUserThunk,

  loadUserStarted: () => action(UserActionType.LOAD_USER_STARTED),

  loadUserCompleted: () => action(UserActionType.LOAD_USER_COMPLETED)
};

function loadUserThunk() {
  return async (dispatch: Dispatch<Action>, getState: GetState) => {
    dispatch(userActionCreator.loadUserStarted());
    await stay(2000);
    dispatch(userActionCreator.loadUserCompleted());
  };
}

export type UserAction = ActionType<typeof userActionCreator>;

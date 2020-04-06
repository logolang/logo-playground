import { GetState, TDispatch } from "store/store";

import { envActionCreator } from "./actions.env";
import { getConfig as getAppConfig } from "services/app-config";
import { DISetup } from "di-setup";
import { resolve } from "utils/di";
import { AuthProvider, AuthService } from "services/infrastructure/auth-service";
import { UserSettings } from "services/user-settings";
import { UserSettingsService } from "services/user-settings.service";
import { NotificationType } from "./state.env";
import {
  EventsTrackingService,
  EventAction
} from "services/infrastructure/events-tracking.service";

function initEnvThunk() {
  return async (dispatch: TDispatch) => {
    dispatch(envActionCreator.initEnvStarted());
    const appConfig = getAppConfig();
    const initInfo = await DISetup.setup({ appConfig });

    dispatch(envActionCreator.applyUserSettingsCompleted(initInfo.userSettings));
    dispatch(envActionCreator.signInCompleted(initInfo.user));
  };
}

function signInThunk(authProvider: AuthProvider) {
  return async (dispatch: TDispatch) => {
    const auth = resolve(AuthService);
    await auth.signIn(authProvider);
    await dispatch(initEnvThunk());

    const eventsTracker = resolve(EventsTrackingService);
    eventsTracker.sendEvent(EventAction.userLogin);
  };
}

function signOutThunk() {
  return async (dispatch: TDispatch) => {
    const auth = resolve(AuthService);
    await auth.signOut();
    await dispatch(initEnvThunk());

    const eventsTracker = resolve(EventsTrackingService);
    eventsTracker.sendEvent(EventAction.userLogout);
  };
}

function applyUserSettingsThunk(
  settings: Partial<UserSettings>,
  options?: { rebindServices: boolean }
) {
  return async (dispatch: TDispatch) => {
    const settingsService = resolve(UserSettingsService);
    await settingsService.update(settings);
    if (options && options.rebindServices) {
      await dispatch(initEnvThunk());
    } else {
      const newSettings = await settingsService.get();
      dispatch(envActionCreator.applyUserSettingsCompleted(newSettings));
    }
  };
}

function showNotificationAutoCloseThunk(type: NotificationType, title: string, message: string) {
  return async (dispatch: TDispatch, getState: GetState) => {
    dispatch(envActionCreator.showNotification(type, title, message));
    const lastmessageId = getState().env.notifications[0].id;
    setTimeout(() => {
      dispatch(envActionCreator.closeNotification(lastmessageId));
    }, 3000);
  };
}

export const envThunks = {
  initEnv: initEnvThunk,
  signIn: signInThunk,
  signOut: signOutThunk,
  applyUserSettings: applyUserSettingsThunk,
  showNotificationAutoClose: showNotificationAutoCloseThunk
};

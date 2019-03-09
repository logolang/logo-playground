import { UserSettings, defaultUserSettings } from "services/user-settings";
import { anonymousUser, UserData } from "services/infrastructure/auth-service";
import { Theme, getAllThemes } from "ui/themes/themes-helper";

export enum NotificationType {
  danger = "danger",
  info = "info",
  success = "success",
  warning = "warning",
  primary = "primary"
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  closeTimeout?: number;
}

export interface EnvState {
  isLoading: boolean;
  user: UserData;
  userSettings: UserSettings;
  appTheme: Theme;
  notifications: Notification[];
}

export const defaultEnvState: EnvState = {
  isLoading: true,
  user: anonymousUser,
  userSettings: defaultUserSettings,
  appTheme: getAllThemes()[0],
  notifications: []
};

import { UserSettings, defaultUserSettings } from "app/types/user-settings";
import { anonymousUser, UserData } from "app/services/env/auth-service";

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
  notifications: Notification[];
}

export const defaultEnvState: EnvState = {
  isLoading: true,
  user: anonymousUser,
  userSettings: defaultUserSettings,
  notifications: []
};

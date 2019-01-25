import { UserSettings, defaultUserSettings } from "app/services/env/user-settings.service";

export enum AuthProvider {
  google = "google",
  none = "none"
}

export interface UserData {
  isLoggedIn: boolean;
  authProvider: AuthProvider;
  id: string;
  name: string;
  email: string;
  imageUrl: string;
}

export const anonymousUser: UserData = {
  isLoggedIn: false,
  authProvider: AuthProvider.none,
  id: "guest",
  name: "Guest",
  email: "",
  imageUrl: ""
};

export interface EnvState {
  isLoading: boolean;
  user: UserData;
  userSettings: UserSettings;
}

export const defaultEnvState: EnvState = {
  isLoading: true,
  user: anonymousUser,
  userSettings: defaultUserSettings
};

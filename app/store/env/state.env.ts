import { UserSettings, defaultUserSettings } from "app/types/user-settings";
import { anonymousUser, UserData } from "app/services/env/auth-service";

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

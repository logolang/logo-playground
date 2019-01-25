import { LocalStorage } from "app/services/infrastructure/local-storage";

export interface UserSettings {
  turtleId: string;
  turtleSize: number;
  themeName: string;
  localeId: string;
  currentTutorialId: string;
  currentStepId: string;
}

export const defaultUserSettings: UserSettings = {
  turtleId: "tt12",
  turtleSize: 40,
  themeName: "default",
  localeId: "en",
  currentTutorialId: "01-basics",
  currentStepId: "01-intro"
};

/**
 * This service is to store and get user settings
 * This settings will be probably synchronized to some central settings storage, so User will be able to have them same on all computers and browsers
 * Currently using local browser storage
 */
export class UserSettingsService {
  private localStorage: LocalStorage<UserSettings>;
  private currentData: UserSettings;

  constructor(userEmail: string) {
    const storageKey = `logo-playground-v1.0:settings:${userEmail || "guest"}`;
    this.localStorage = new LocalStorage<UserSettings>(storageKey, defaultUserSettings);
    const settings = this.localStorage.getValue();
    this.currentData = settings;
  }

  async get(): Promise<UserSettings> {
    return this.currentData;
  }

  async update(update: Partial<UserSettings>): Promise<void> {
    this.currentData = { ...this.currentData, ...update };
    return this.localStorage.setValue(this.currentData);
  }
}

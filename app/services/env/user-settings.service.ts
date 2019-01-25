import { LocalStorageService } from "app/services/infrastructure/local-storage.service";

export interface UserSettings {
  turtleId: string;
  turtleSize: number;
  themeName: string;
  localeId: string;
  currentTutorialId: string;
  currentStepId: string;
}

/**
 * This service is to store and get user settings
 * This settings will be probably synchronized to some central settings storage, so User will be able to have them same on all computers and browsers
 * Currently using local browser storage
 */
export class UserSettingsService {
  private localStorage: LocalStorageService<UserSettings>;
  private currentData: UserSettings;

  constructor(private userEmail: string) {
    this.localStorage = new LocalStorageService<UserSettings>(this.userSettingsKey, {} as any);
    const settings = this.localStorage.getValue();

    //Apply default values
    settings.localeId = settings.localeId || "en";
    settings.turtleSize = settings.turtleSize || 40;

    this.currentData = settings;
  }

  async saveDataToStorage(): Promise<void> {
    this.localStorage.setValue(this.currentData);
  }

  public get userSettingsKey() {
    const userId = this.userEmail || "guest";
    return `logo-playground.settings:${userId}`;
  }

  async get(): Promise<UserSettings> {
    return this.currentData;
  }

  async update<K extends keyof UserSettings>(update: Pick<UserSettings, K>): Promise<void> {
    Object.assign(this.currentData, update);
    return this.saveDataToStorage();
  }
}

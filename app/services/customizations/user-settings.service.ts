import { injectable, inject } from "app/di";
import { LocalStorageService } from "app/services/infrastructure/local-storage.service";
import { CurrentUserService } from "app/services/login/current-user.service";

export abstract class IUserSettingsService {
  abstract get(): Promise<IUserSettings>;
  abstract update<K extends keyof IUserSettings>(update: Pick<IUserSettings, K>): Promise<void>;
}

export interface IUserSettings {
  turtleId: string;
  turtleSize: number;
  themeName: string;
  localeId: string;
  currentTutorialInfo?: ICurrentTutorialInfo;
  playgroundLayoutJSON?: string;
  playgroundLayoutMobileJSON?: string;
  tutorialsLayoutJSON?: string;
  tutorialsLayoutMobileJSON?: string;
}

export interface ICurrentTutorialInfo {
  tutorialId: string;
  stepId: string;
}

@injectable() /**
 * This service is to store and get user settings
 * This settings will be probably synchronized to some central settings storage, so User will be able to have them same on all computers and browsers
 * Currently using local browser storage
 */
export class UserSettingsBrowserLocalStorageService implements IUserSettingsService {
  private localStorage: LocalStorageService<IUserSettings>;
  private currentData: IUserSettings;

  constructor(@inject(CurrentUserService) private currentUser: CurrentUserService) {
    const userId = this.currentUser.getLoginStatus().userInfo.attributes.email || "guest";
    this.localStorage = new LocalStorageService<IUserSettings>(`logo-playground.settings:${userId}`, {} as any);
    const settings = this.localStorage.getValue();

    //Apply default values
    settings.localeId = settings.localeId || "en";
    settings.turtleSize = settings.turtleSize || 40;

    this.currentData = settings;
  }

  async saveDataToStorage(): Promise<void> {
    this.localStorage.setValue(this.currentData);
  }

  async get(): Promise<IUserSettings> {
    return this.currentData;
  }

  async update<K extends keyof IUserSettings>(update: Pick<IUserSettings, K>): Promise<void> {
    Object.assign(this.currentData, update);
    return this.saveDataToStorage();
  }
}

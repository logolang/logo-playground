import { injectable, inject } from "app/di";
import { LocalStorageService } from "app/services/infrastructure/local-storage.service";
import { ICurrentUserService } from "app/services/login/current-user.service";

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
  tutorialsLayoutJSON?: string;
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

  constructor(@inject(ICurrentUserService) private currentUser: ICurrentUserService) {
    const userId = this.currentUser.getLoginStatus().userInfo.attributes.email;
    this.localStorage = new LocalStorageService<IUserSettings>(`logo-sandbox-${userId}-usersettings`, {} as any);
    const localStorageValue = this.localStorage.getValue();

    //Apply default values
    localStorageValue.localeId = localStorageValue.localeId || "en";

    this.currentData = localStorageValue;
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

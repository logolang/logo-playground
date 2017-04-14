/**
 * This service is to store and get user settings
 * This settings will be probably synchronized to some central settings storage, so User will be able to have them same on all computers and browsers
 * 
 * Currently using local browser storage
 */
import { LocalStorageService } from "app/services/infrastructure/local-storage.service";

export interface IUserSettingsService {
    get(): Promise<IUserSettings>
    update<K extends keyof IUserSettings>(update: Pick<IUserSettings, K>): Promise<void>;
}

export interface IUserSettings {
    turtleId: string
    turtleSize: number
    themeName: string
    localeId: string
}

export class UserSettingsBrowserLocalStorageService implements IUserSettingsService {
    private localStorage: LocalStorageService<IUserSettings>;
    private currentData: IUserSettings;

    constructor(private userId: string) {
        this.localStorage = new LocalStorageService<IUserSettings>(`logo-sandbox-${userId}-settings`, {} as any);
        const localStorageValue = this.localStorage.getValue();
        this.currentData = localStorageValue;
    }

    async saveDataToStorage(): Promise<void> {
        this.localStorage.setValue(this.currentData);
    }

    async get(): Promise<IUserSettings> {
        return this.currentData;
    }

    async update<K extends keyof IUserSettings>(update: Pick<IUserSettings, K>): Promise<void> {
        this.currentData = Object.assign(this.currentData, update);
        return this.saveDataToStorage();
    }
}
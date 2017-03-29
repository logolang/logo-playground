/**
 * This service is to store and get user settings
 * This settings will be probably synchronized to some central settings storage, so User will be able to have them same on all computers and browsers
 * 
 * Currently using local browser storage
 */
import { LocalStorageService } from "app/services/infrastructure/local-storage.service";

export interface IUserSettingsService {
    getAll(): Promise<AllUserSettings>

    getTurtleName(): Promise<string>
    setTurtleName(value: string): Promise<void>

    getTurtleSize(): Promise<number>
    setTurtleSize(value: number): Promise<void>

    getUiThemeName(): Promise<string>
    setUiThemeName(value: string): Promise<void>
}

interface ILocalStorageData {
    turtleName?: string
    turtleSize?: number
    themeName?: string
}

export interface AllUserSettings {
    turtleName: string
    turtleSize: number
    themeName: string
}

export class UserSettingsBrowserLocalStorageService implements IUserSettingsService {
    private localStorage: LocalStorageService<ILocalStorageData>;
    private currentData: AllUserSettings;

    constructor(private userId: string) {
        this.localStorage = new LocalStorageService(`logo-sandbox-${userId}-settings`, {});
        const localStorageValue = this.localStorage.getValue();
        this.currentData = {
            themeName: localStorageValue.themeName || `default`,
            turtleName: localStorageValue.turtleName || `Bright Runner`,
            turtleSize: localStorageValue.turtleSize || 40
        }
    }

    async saveDataToStorage(): Promise<void> {
        this.localStorage.setValue(this.currentData);
    }

    async getAll(): Promise<ILocalStorageData> {
        return this.currentData;
    }

    async getTurtleName(): Promise<string> {
        return this.currentData.turtleName;
    }

    async setTurtleName(value: string): Promise<void> {
        this.currentData.turtleName = value;
        return this.saveDataToStorage();
    }

    async getTurtleSize(): Promise<number> {
        return this.currentData.turtleSize;
    }

    async setTurtleSize(value: number): Promise<void> {
        this.currentData.turtleSize = value;
        return this.saveDataToStorage();
    }

    async getUiThemeName(): Promise<string> {
        return this.currentData.themeName;
    }

    async setUiThemeName(value: string): Promise<void> {
        this.currentData.themeName = value;
        return this.saveDataToStorage();
    }
}
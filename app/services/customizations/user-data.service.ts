/**
 * This service is to store and get user data stored in local browser
 * So this data is designed as not be to synchronized to whatever backend whenever
 * This data is persisted only for current browser
 */
import { LocalStorageService } from "app/services/infrastructure/local-storage.service";

export interface IUserDataService {
    getPlaygroundCode(): Promise<string>
    setPlaygroundCode(value: string): Promise<void>

    getPlaygroundLayoutJSON(): Promise<string>
    setPlaygroundLayoutJSON(value: string): Promise<void>

    getCurrentTutorialInfo(): Promise<ICurrentTutorialInfo>
    setCurrentTutorialInfo(value: ICurrentTutorialInfo): Promise<void>
}

interface ICurrentTutorialInfo {
    tutorialName: string,
    step: number,
    code: string
}

interface ILocalStorageData {
    playgroundCode?: string
    playgroundLayoutSerialized?: string
    currentTutorialInfo?: ICurrentTutorialInfo
}

const defaultPlaygroundProgram = `
;This is LOGO program sample
forward 50
right 90
forward 100
arc 360 50
`;

export class UserDataBrowserLocalStorageService implements IUserDataService {
    private localStorage: LocalStorageService<ILocalStorageData>;
    private currentData: ILocalStorageData;

    constructor(private userId: string) {
        this.localStorage = new LocalStorageService(`logo-sandbox-${userId}-data`, {});
        this.currentData = this.localStorage.getValue();
    }

    async saveDataToStorage(): Promise<void> {
        this.localStorage.setValue(this.currentData);
    }

    async getPlaygroundCode(): Promise<string> {
        return this.currentData.playgroundCode || defaultPlaygroundProgram;
    }

    async setPlaygroundCode(code: string): Promise<void> {
        this.currentData.playgroundCode = code;
        return this.saveDataToStorage();
    }

    async getPlaygroundLayoutJSON(): Promise<string> {
        return this.currentData.playgroundLayoutSerialized || defaultPlaygroundProgram;
    }

    async setPlaygroundLayoutJSON(value: string): Promise<void> {
        this.currentData.playgroundLayoutSerialized = value;
        return this.saveDataToStorage();
    }

    async getCurrentTutorialInfo(): Promise<ICurrentTutorialInfo> {
        return this.currentData.currentTutorialInfo || {
            code: '',
            step: 0,
            tutorialName: ''
        };
    }

    async setCurrentTutorialInfo(value: ICurrentTutorialInfo): Promise<void> {
        this.currentData.currentTutorialInfo = value;
        return this.saveDataToStorage();
    }
}
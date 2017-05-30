import { injectable, inject } from "app/di";
import { LocalStorageService } from "app/services/infrastructure/local-storage.service";
import { ICurrentUserProvider } from "app/services/login/current-user.provider";

export abstract class IUserDataService {
    abstract getPlaygroundCode(): Promise<string>
    abstract setPlaygroundCode(value: string): Promise<void>

    abstract getPlaygroundLayoutJSON(): Promise<string>
    abstract setPlaygroundLayoutJSON(value: string): Promise<void>

    abstract getCurrentTutorialInfo(): Promise<ICurrentTutorialInfo>
    abstract setCurrentTutorialInfo(value: ICurrentTutorialInfo): Promise<void>
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

@injectable()
/**
 * This service is to store and get user data stored in local browser
 * So this data is designed as not be to synchronized to whatever backend whenever
 * This data is persisted only in current browser
 */
export class UserDataBrowserLocalStorageService implements IUserDataService {
    private localStorage: LocalStorageService<ILocalStorageData>;
    private currentData: ILocalStorageData;

    constructor(
        @inject(ICurrentUserProvider) private currentUser: ICurrentUserProvider
    ) {
        const userId = this.currentUser.getLoginStatus().userInfo.id;
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
        return this.currentData.playgroundLayoutSerialized || "";
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
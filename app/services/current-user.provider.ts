import { Observable, Subject } from 'rxjs/Rx';
import { LoginStatus } from './login.service';
import { LocalStorageService } from './local-storage.service';

export class LocalStoredUserSettings {
    constructor(public login: string, public authToken: string) {
    }
}

export interface ICurrentUserProvider {
    getLocalStoredUserSettings(): LocalStoredUserSettings | undefined;
    eraseLocalStoredUserSettings(): void;
    setLoginStatus(loginStatus: LoginStatus, rememberMe: boolean): void;
    getLoginStatus(): LoginStatus;
    loginStatusObservable: Observable<LoginStatus>;
}

export class CurrentUserProvider implements ICurrentUserProvider {
    private storage = new LocalStorageService<LocalStoredUserSettings>(`${appInfo.name}.v${appInfo.version}:user:settings`, undefined);
    private currentLoginStatus: LoginStatus | undefined;
    private loginStatusSubject = new Subject<LoginStatus>();

    constructor() {
    }

    getLocalStoredUserSettings(): LocalStoredUserSettings | undefined {
        let settings = this.storage.getValue();
        if (settings
            && settings.login
            && settings.authToken) {
            return settings;
        }
        return undefined;
    }

    eraseLocalStoredUserSettings(): void {
        this.storage.clearValue();
    }

    setLoginStatus(loginStatus: LoginStatus, rememberMe: boolean) {
        this.currentLoginStatus = loginStatus;
        if (loginStatus.sussess && rememberMe) {
            this.storage.setValue({
                authToken: loginStatus.authToken,
                login: loginStatus.userInfo.login
            })
        };

        this.loginStatusSubject.next(this.currentLoginStatus);
    }

    getLoginStatus(): LoginStatus {
        if (this.currentLoginStatus) {
            return this.currentLoginStatus;
        }
        throw new Error('Current user credentials are not defined yet!');
    }

    get loginStatusObservable(): Observable<LoginStatus> {
        return this.loginStatusSubject;
    }
}
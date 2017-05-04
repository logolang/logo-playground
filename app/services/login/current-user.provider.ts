import { Observable, Subject } from 'rxjs/Rx';
import { UserInfo } from "app/services/login/user-info";
import { GoogleAuthProvider } from "app/services/login/google-auth.provider";

export interface LoginStatus {
    isLoggedIn: boolean
    userInfo: UserInfo
}

export interface ICurrentUserProvider {
    getLoginStatus(): LoginStatus
    loginStatusObservable: Observable<LoginStatus>
    signOut(): Promise<void>
    renderLoginUIAllProviders(): JSX.Element[]
    initLoginUIAllProviders(): Promise<void>
}

export class CurrentUserProvider implements ICurrentUserProvider {
    private loginStatusSubject = new Subject<LoginStatus>();
    private googleAuth: GoogleAuthProvider;

    private readonly guestUser: LoginStatus = {
        isLoggedIn: false,
        userInfo: {
            attributes: {
                email: "",
                imageUrl: "",
                name: "Guest"
            }, id: "0"
        }
    };

    private currentLoginStatus = this.guestUser;

    constructor(googleClientId: string) {
        this.googleAuth = new GoogleAuthProvider(googleClientId);
        this.googleAuth.loginStatusObservable.subscribe(status => {
            this.currentLoginStatus = status || this.guestUser;
            this.loginStatusSubject.next(this.currentLoginStatus);
        })
    }

    async init(): Promise<LoginStatus> {
        const loginStatus = await this.googleAuth.init();
        this.currentLoginStatus = loginStatus || this.guestUser;
        return this.currentLoginStatus;
    }

    getLoginStatus(): LoginStatus {
        if (this.currentLoginStatus) {
            return this.currentLoginStatus;
        }
        throw new Error('Current user credentials are not defined!');
    }

    get loginStatusObservable(): Observable<LoginStatus> {
        return this.loginStatusSubject;
    }

    async signOut(): Promise<void> {
        return this.googleAuth.signOut();
    }

    renderLoginUIAllProviders(): JSX.Element[] {
        return [this.googleAuth.renderLoginUI()];
    }

    async initLoginUIAllProviders(): Promise<void> {
        this.googleAuth.initLoginUI();
    }
}
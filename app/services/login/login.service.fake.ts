import { Subject, Subscription } from 'rxjs'
import { stay } from 'app/utils/async-helpers';

import { ILoginService, LoginCredentials, LoginServiceHelpers, LoginStatus } from './login.service';
import { FakeDataProvider } from "app/services/fake-data-provider";

export class FakeLoginService implements ILoginService {
    loginRequestsSubj = new Subject<void>();

    async loginWithToken(token: string, login: string): Promise<LoginStatus> {
        //await stay(1000);
        return this.doLogin(login);
    }

    async login(credentials: LoginCredentials): Promise<LoginStatus> {
        await stay(1000);
        return this.doLogin(credentials.login);
    }

    private doLogin(login: string): LoginStatus {
        const users = FakeDataProvider.getFakeUsers();

        let user = users.find(u => u.login.toLowerCase() === login.toLowerCase());
        if (user) {
            return {
                userInfo: user,
                authToken: 'blabla',
                isLoggedIn: true,
                errorMessage: ''
            };
        } else {
            return LoginServiceHelpers.getInvalidLoginStatus(login, 'Sorry, we couldn’t find an account with that username / password. Please try again or contact your system administrator');
        }
    }

    async logout(): Promise<void> {
        await stay(1000);
    }

    requestNewLogin(): void {
        this.loginRequestsSubj.next();
    }

    subscribeToLoginRequest(event: () => void): Subscription {
        return this.loginRequestsSubj.subscribe(event);
    }
}
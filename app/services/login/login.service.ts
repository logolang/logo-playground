import * as isomorphicFetch from 'isomorphic-fetch';
import { Subscription } from 'rxjs'
import { ensure } from 'app/utils/syntax-helpers';
import { handleAsyncError } from 'app/utils/async-helpers';

import { UserInfo } from "app/services/login/user-info";

export interface LoginCredentials {
    login: string,
    password: string,
    rememberMe: boolean
}

export interface LoginStatus {
    isLoggedIn: boolean,
    authToken: string,
    errorMessage: string,
    userInfo: UserInfo
}

export interface ILoginService {
    login(credentials: LoginCredentials): Promise<LoginStatus>
    loginWithToken(token: string, login: string): Promise<LoginStatus>
    logout(): Promise<void>
    requestNewLogin(): void
    subscribeToLoginRequest(event: () => void): Subscription
}

export class LoginServiceHelpers {
    static getInvalidLoginStatus(login: string, error: string): LoginStatus {
        return {
            userInfo: {
                id: '',
                login: login,
                attributes: {
                    name: '',
                    editedBy: '',
                    editedOn: new Date(0)
                }
            },
            isLoggedIn: false,
            authToken: '',
            errorMessage: error
        }
    }
}
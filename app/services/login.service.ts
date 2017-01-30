import * as isomorphicFetch from 'isomorphic-fetch';
import { ensure } from 'app/utils/syntax-helpers';
import { handleAsyncError } from 'app/utils/async-helpers';

import { UserInfo } from 'app/model/entities/user-info';
import { LocalStorageService } from './local-storage.service';
import { IUsersRepository } from './entities/users.repository';

export interface LoginCredentials {
    login: string,
    password: string,
    rememberMe: boolean
}

export interface LoginStatus {
    sussess: boolean,
    authToken: string,
    errorMessage: string,
    userInfo: UserInfo
}

export interface ILoginService {
    login(credentials: LoginCredentials): Promise<LoginStatus>;
    loginWithToken(token: string, login: string): Promise<LoginStatus>;
    logout(): Promise<void>;
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
            sussess: false,
            authToken: '',
            errorMessage: error
        }
    }
}
import { Observable, Subject } from "rxjs/Rx";
import { UserInfo, AuthProvider } from "app/services/login/user-info";
import { injectable } from "app/di";

export interface LoginStatus {
  isLoggedIn: boolean;
  userInfo: UserInfo;
}

export const NotLoggenInStatus: LoginStatus = Object.freeze({
  isLoggedIn: false,
  userInfo: {
    attributes: {
      authProvider: AuthProvider.none,
      email: "",
      imageUrl: "",
      name: ""
    },
    id: "0"
  }
});

export abstract class ICurrentUserService {
  abstract getLoginStatus(): LoginStatus;
  abstract setLoginStatus(loginStatus: LoginStatus): void;
  abstract loginStatusObservable: Observable<LoginStatus>;
}

@injectable()
export class CurrentUserService implements ICurrentUserService {
  private currentLoginStatus = NotLoggenInStatus;
  private loginStatusSubject = new Subject<LoginStatus>();

  setLoginStatus(loginStatus: LoginStatus) {
    this.currentLoginStatus = loginStatus;
    this.loginStatusSubject.next(this.currentLoginStatus);
  }

  getLoginStatus(): LoginStatus {
    return this.currentLoginStatus;
  }

  get loginStatusObservable(): Observable<LoginStatus> {
    return this.loginStatusSubject;
  }
}

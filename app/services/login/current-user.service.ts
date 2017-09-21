import { Observable, Subject } from "rxjs/Rx";
import { UserInfo } from "app/services/login/user-info";
import { injectable } from "app/di";

export interface LoginStatus {
  isLoggedIn: boolean;
  userInfo: UserInfo;
}

export const NotLoggenInStatus: LoginStatus = Object.freeze({
  isLoggedIn: false,
  userInfo: {
    attributes: {
      email: "",
      imageUrl: "",
      name: "Guest"
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
  private currentLoginStatus: LoginStatus | undefined;
  private loginStatusSubject = new Subject<LoginStatus>();

  setLoginStatus(loginStatus: LoginStatus) {
    this.currentLoginStatus = loginStatus;
    this.loginStatusSubject.next(this.currentLoginStatus);
  }

  getLoginStatus(): LoginStatus {
    if (this.currentLoginStatus) {
      return this.currentLoginStatus;
    }
    throw new Error("Current user credentials are not defined yet!");
  }

  get loginStatusObservable(): Observable<LoginStatus> {
    return this.loginStatusSubject;
  }
}

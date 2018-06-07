import { Subject } from "rxjs/Subject";
import { Observable } from "rxjs/Observable";

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

@injectable()
export class CurrentUserService {
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
    return this.loginStatusSubject.asObservable();
  }
}

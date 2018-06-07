import { Observable } from "rxjs/Observable";

import { LoginStatus } from "app/services/login/current-user.service";

export interface IAuthService {
  init(): Promise<void>;
  getLoginStatus(): LoginStatus;
  loginStatusObservable: Observable<LoginStatus>;
  signOut(): Promise<void>;
  renderLoginUI(): JSX.Element;
  initLoginUI(): Promise<void>;
}

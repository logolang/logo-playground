import { LoginStatus } from "app/services/login/current-user.service";
import { Observable } from "rxjs/Rx";

export interface IAuthService {
  init(): Promise<void>;
  getLoginStatus(): LoginStatus;
  loginStatusObservable: Observable<LoginStatus>;
  signOut(): Promise<void>;
  renderLoginUI(): JSX.Element;
  initLoginUI(): Promise<void>;
}

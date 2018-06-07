import { IAuthService } from "app/services/login/auth.service";
import { NotLoggenInStatus, CurrentUserService } from "app/services/login/current-user.service";
import { EventsTrackingService, EventAction } from "app/services/infrastructure/events-tracking.service";

export class LoginService {
  private currentLoginStatus = NotLoggenInStatus;

  constructor(
    private authService: IAuthService,
    private currentUserService: CurrentUserService,
    private eventTracker: EventsTrackingService
  ) {
    this.authService.loginStatusObservable.subscribe(status => {
      this.currentLoginStatus = status;
      this.currentUserService.setLoginStatus(status);
    });
  }

  async tryLoginUserAutomatically(): Promise<void> {
    await this.authService.init();
  }

  async initLoginUI(): Promise<void> {
    return this.authService.initLoginUI();
  }

  renderLoginUI(): JSX.Element[] {
    return [this.authService.renderLoginUI()];
  }

  async signOut(): Promise<void> {
    this.eventTracker.sendEvent(EventAction.userLogin, this.currentLoginStatus.userInfo.attributes.email);

    return this.authService.signOut();
  }
}

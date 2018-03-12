import * as React from "react";
import { LoginStatus, NotLoggenInStatus } from "app/services/login/current-user.service";
import { Subject } from "rxjs/Subject";
import { IAuthService } from "app/services/login/auth.service";
import { AuthProvider } from "app/services/login/user-info";
import { _T } from "app/services/customizations/localization.service";

export class GoogleAuthService implements IAuthService {
  private isSignedIn: boolean = false;
  private loginStatus: LoginStatus;
  private loginStatusSubject = new Subject<LoginStatus>();

  constructor(private googleClientId: string) {}

  getLoginStatus(): LoginStatus {
    return this.loginStatus;
  }

  get loginStatusObservable() {
    return this.loginStatusSubject;
  }

  async init(): Promise<void> {
    const gapi = (window as any).gapi;
    if (!gapi) {
      return;
    }

    return new Promise<void>((resolve, reject) => {
      gapi.load("client:auth2", async () => {
        try {
          await this.initGoogleAuth(gapi);
          resolve();
        } catch (ex) {
          reject(ex);
        }
      });
    });
  }

  private initGoogleAuth = async (gapi: any): Promise<void> => {
    const auth2 = await gapi.client
      .init({
        clientId: this.googleClientId,
        scope: "profile email https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.file",
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"]
      })
      .then();

    const auth = gapi.auth2.getAuthInstance();

    //Get current user
    const googleUser = auth.currentUser.get();
    this.updateSigninStatus(googleUser);

    // Listen for changes to current user.
    auth.currentUser.listen((googleUser: any) => {
      console.log("4");
      this.updateSigninStatus(googleUser);
    });
  };

  private updateSigninStatus = (googleUser: any) => {
    const profile = googleUser && googleUser.getBasicProfile();
    if (profile) {
      const loginStatus: LoginStatus = {
        isLoggedIn: true,
        userInfo: {
          attributes: {
            authProvider: AuthProvider.google,
            email: profile.getEmail(),
            imageUrl: profile.getImageUrl(),
            name: profile.getName()
          },
          id: profile.getId()
        }
      };
      this.isSignedIn = true;
      this.loginStatus = loginStatus;
      this.loginStatusSubject.next(this.loginStatus);
    } else {
      this.isSignedIn = false;
      this.loginStatus = NotLoggenInStatus;
      this.loginStatusSubject.next(this.loginStatus);
    }
  };

  async signOut(): Promise<void> {
    if (this.isSignedIn) {
      const gapi = (window as any).gapi;
      const auth2 = gapi.auth2.getAuthInstance();
      return auth2.signOut();
    }
  }

  async signIn(): Promise<void> {
    const gapi = (window as any).gapi;
    const auth2 = gapi.auth2.getAuthInstance();
    return auth2.signIn();
  }

  renderLoginUI(): JSX.Element {
    return (
      <div key="login-elem-google">
        <button type="button" className="button is-info" onClick={async () => this.signIn()}>
          <span className="icon">
            <i className="fa fa-google" aria-hidden="true" />
          </span>
          <span>{_T("Sign in with Google")}</span>
        </button>
      </div>
    );
  }

  async initLoginUI(): Promise<void> {
    /** Nothing here */
  }
}

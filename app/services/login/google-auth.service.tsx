import * as React from "react";
import { LoginStatus, NotLoggenInStatus } from "app/services/login/current-user.service";
import { Subject } from "rxjs";
import { IAuthService } from "app/services/login/auth.service";
import { AuthProvider } from "app/services/login/user-info";
import { $T } from "app/i18n/strings";

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
      gapi.load("client:auth2", {
        callback: async () => {
          try {
            await this.initGoogleAuth(gapi);
            resolve();
          } catch (ex) {
            reject(ex);
          }
        },
        onerror: () => {
          reject("gapi.client failed to load");
        }
      });
    });
  }

  private initGoogleAuth = async (gapi: any): Promise<void> => {
    await gapi.client.init({
      clientId: this.googleClientId,
      scope: "profile email https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.file",
      discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
      prompt: "select_account"
    });

    const auth = gapi.auth2.getAuthInstance();

    // Get current user
    const googleUser = auth.currentUser.get();
    this.updateSigninStatus(googleUser);

    // Listen for changes to current user.
    auth.currentUser.listen((googleUser: any) => {
      console.log("auth.currentUser.listen", googleUser);
      this.updateSigninStatus(googleUser);
    });
  };

  private updateSigninStatus = (googleUser: any) => {
    const isSignedIn = googleUser && googleUser.isSignedIn();
    const profile = googleUser && googleUser.getBasicProfile();
    if (isSignedIn && profile) {
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
      await auth2.signOut();
      this.loginStatusSubject.next(NotLoggenInStatus);
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
          <span>{$T.common.signInWithGoogle}</span>
        </button>
      </div>
    );
  }

  async initLoginUI(): Promise<void> {
    /** Nothing here */
  }
}

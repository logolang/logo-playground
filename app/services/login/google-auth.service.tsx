import * as React from "react";
import { LoginStatus, NotLoggenInStatus } from "app/services/login/current-user.service";
import { Subject } from "rxjs/Subject";
import { IAuthService } from "app/services/login/auth.service";

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

    let isResolved = false;
    const promise = new Promise<void>(resolve => {
      gapi.load("auth2", () => {
        const auth2 = gapi.auth2.init({
          client_id: this.googleClientId,
          scope: "profile email"
        });

        // Listen for changes to current user.
        auth2.currentUser.listen((googleUser: any) => {
          const profile = googleUser.getBasicProfile();
          if (profile) {
            const loginStatus: LoginStatus = {
              isLoggedIn: true,
              userInfo: {
                attributes: {
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
            if (!isResolved) {
              isResolved = true;
              resolve();
            }
          } else {
            this.isSignedIn = false;
            this.loginStatus = NotLoggenInStatus;
            this.loginStatusSubject.next(this.loginStatus);
            if (!isResolved) {
              isResolved = true;
              resolve();
            }
          }
        });
      });
    });
    return promise;
  }

  async signOut(): Promise<void> {
    if (this.isSignedIn) {
      const gapi = (window as any).gapi;
      const auth2 = gapi.auth2.getAuthInstance();
      return auth2.signOut();
    }
  }

  renderLoginUI(): JSX.Element {
    return (
      <div
        key="google-auth"
        id="google-btn-signin2"
        className="g-signin2"
        data-width="300"
        data-height="200"
        data-longtitle="true"
      />
    );
  }

  async initLoginUI(): Promise<void> {
    const gapi = (window as any).gapi;
    if (gapi) {
      gapi.signin2.render("google-btn-signin2", {
        client_id: this.googleClientId,
        scope: "profile email",
        width: 240,
        height: 50,
        longtitle: true,
        theme: "dark"
      });
    }
  }
}

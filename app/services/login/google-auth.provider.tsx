import * as React from "react";
import { LoginStatus } from "app/services/login/current-user.provider";
import { Subject } from "rxjs/Subject";

export class GoogleAuthProvider {
    private isSignedIn: boolean = false;
    private loginStatusSubject = new Subject<LoginStatus | undefined>();

    constructor(private googleClientId: string) {
    }

    get loginStatusObservable() {
        return this.loginStatusSubject;
    }

    init(): Promise<LoginStatus | undefined> {
        const gapi = (window as any).gapi;
        if (!gapi) {
            return Promise.resolve(undefined);
        }

        let isResolved = false;
        const promise = new Promise<LoginStatus | undefined>(resolve => {
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
                                }, id: profile.getId()
                            }
                        }
                        this.isSignedIn = true;
                        if (!isResolved) {
                            isResolved = true;
                            resolve(loginStatus);

                        }
                        this.loginStatusSubject.next(loginStatus);
                    } else {
                        if (!isResolved) {
                            isResolved = true;
                            resolve(undefined);
                        }
                        this.loginStatusSubject.next(undefined);
                    }
                });
            });
        })
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
        return <div key="google-auth" id="google-btn-signin2" className="g-signin2" data-width="300" data-height="200" data-longtitle="true"></div>;
    }

    initLoginUI() {
        const gapi = (window as any).gapi;
        gapi.signin2.render("google-btn-signin2", {
            client_id: this.googleClientId,
            scope: "profile email",
            width: 240,
            height: 50,
            longtitle: true,
            theme: "dark",
        });
    }
}
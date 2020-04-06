/* eslint-disable @typescript-eslint/no-explicit-any */
export interface UserInfo {
  email: string;
  imageUrl: string;
  name: string;
  id: string;
}

// Google API global variable
declare const gapi:
  | {
      auth2?: {
        getAuthInstance(): any;
      };
      client: any;
      load(api: string, options: any): void;
    }
  | undefined;

export class GoogleAuthService {
  constructor(private googleClientId: string) {}

  async init(): Promise<UserInfo | undefined> {
    try {
      if (!gapi) {
        throw new Error("Google API is not loaded");
      }
      if (!gapi.auth2) {
        await this.loadGApiAuth();

        await gapi.client.init({
          clientId: this.googleClientId,
          scope:
            "profile email https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.file",
          discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
          prompt: "select_account"
        });
      }

      if (!gapi.auth2) {
        throw new Error("Failed to initialize google API");
      }

      const auth = gapi.auth2.getAuthInstance();

      // Get current user
      const googleUser = auth.currentUser.get();
      return this.getLoginInfo(googleUser);
    } catch (ex) {
      return undefined;
    }
  }

  private async loadGApiAuth(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!gapi) {
        throw new Error("Failed to init auth: Google API is not loaded");
      }

      gapi.load("client:auth2", {
        callback: () => {
          resolve();
        },
        onerror: () => {
          reject();
        },
        // The number of milliseconds to wait before calling the ontimeout function, if the libraries still haven't loaded.
        timeout: 5000,
        // The function called if the libraries loading has taken more time than specified by the timeout parameter.
        ontimeout: () => {
          reject();
        }
      });
    });
  }

  private getLoginInfo = (googleUser: any): UserInfo | undefined => {
    const isSignedIn = googleUser && googleUser.isSignedIn();
    const profile = googleUser && googleUser.getBasicProfile();
    if (isSignedIn && profile) {
      const loginInfo = {
        email: profile.getEmail(),
        imageUrl: profile.getImageUrl(),
        name: profile.getName(),
        id: profile.getId()
      };
      return loginInfo;
    }
    return undefined;
  };

  async signOut(): Promise<void> {
    if (!gapi || !gapi.auth2) {
      throw new Error("Failed to sign out: Google API is not loaded");
    }
    const auth = gapi.auth2.getAuthInstance();
    await auth.signOut();
  }

  async signIn(): Promise<UserInfo | undefined> {
    await this.init();
    if (!gapi || !gapi.auth2) {
      throw new Error("Failed to sign in: Google API is not loaded");
    }
    const auth = gapi.auth2.getAuthInstance();
    await auth.signIn();
    const googleUser = auth.currentUser.get();
    return this.getLoginInfo(googleUser);
  }
}

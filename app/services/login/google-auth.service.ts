import { AuthProvider } from "app/store/user/state.user";

interface LoginInfo {
  isLoggedIn: boolean;
  authProvider: AuthProvider;
  email: string;
  imageUrl: string;
  name: string;
  id: string;
}

export class GoogleAuthService {
  constructor(private googleClientId: string) {}

  async init(): Promise<LoginInfo | undefined> {
    try {
      const gapi = await this.loadGApi();

      await gapi.client.init({
        clientId: this.googleClientId,
        scope:
          "profile email https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.file",
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
        prompt: "select_account"
      });

      const auth = gapi.auth2.getAuthInstance();

      // Get current user
      const googleUser = auth.currentUser.get();
      return this.getLoginInfo(googleUser);
    } catch (ex) {
      return undefined;
    }
  }

  private async loadGApi(): Promise<any> {
    const gapi = (window as any).gapi;
    if (!gapi) {
      return undefined;
    }
    return new Promise((resolve, reject) => {
      gapi.load("client:auth2", {
        callback: () => {
          resolve(gapi);
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

  private getLoginInfo = (googleUser: any): LoginInfo | undefined => {
    const isSignedIn = googleUser && googleUser.isSignedIn();
    const profile = googleUser && googleUser.getBasicProfile();
    if (isSignedIn && profile) {
      const loginInfo = {
        isLoggedIn: true,
        authProvider: AuthProvider.google,
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
    const gapi = (window as any).gapi;
    const auth = gapi.auth2.getAuthInstance();
    await auth.signOut();
  }

  async signIn(): Promise<LoginInfo | undefined> {
    const gapi = (window as any).gapi;
    const auth = gapi.auth2.getAuthInstance();
    await auth.signIn();
    const googleUser = auth.currentUser.get();
    return this.getLoginInfo(googleUser);
  }
}

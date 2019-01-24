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
    const gapi = (window as any).gapi;
    if (!gapi) {
      return;
    }

    await gapi.load("client:auth2");

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

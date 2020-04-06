import { AppConfig } from "services/app-config";
import { LocalStorage } from "services/local-storage";
import { GoogleAuthService, UserInfo } from "services/infrastructure/google-auth.service";
import { localStoragePrefix } from "services/constants";

export enum AuthProvider {
  google = "google",
  none = "none"
}

interface LoginStatus {
  isLoggedIn: boolean;
  authProvider: AuthProvider;
}

const defaultStatus: LoginStatus = {
  isLoggedIn: false,
  authProvider: AuthProvider.none
};

export interface UserData {
  isLoggedIn: boolean;
  authProvider: AuthProvider;
  id: string;
  name: string;
  email: string;
  imageUrl: string;
}

export const anonymousUser: UserData = {
  isLoggedIn: false,
  authProvider: AuthProvider.none,
  id: "",
  name: "",
  email: "",
  imageUrl: ""
};

export class AuthService {
  constructor(private config: AppConfig) {}

  private localStorage = new LocalStorage<LoginStatus>(
    localStoragePrefix + "login-status",
    defaultStatus
  );

  public async init(): Promise<UserData> {
    const loginStatus = this.localStorage.getValue();
    if (loginStatus.isLoggedIn) {
      switch (loginStatus.authProvider) {
        case AuthProvider.google: {
          const ga = new GoogleAuthService(this.config.services.googleClientId);
          const user = await ga.init();
          if (user) {
            return this.getUserData(user);
          }
          break;
        }
      }
    }
    return anonymousUser;
  }

  public async signIn(provider: AuthProvider): Promise<UserData> {
    if (provider === AuthProvider.google) {
      const ga = new GoogleAuthService(this.config.services.googleClientId);
      const user = await ga.signIn();
      if (user) {
        this.localStorage.setValue({ isLoggedIn: true, authProvider: AuthProvider.google });
        return this.getUserData(user);
      }
    }
    this.localStorage.setValue({ isLoggedIn: false, authProvider: AuthProvider.none });
    return anonymousUser;
  }

  public async signOut(): Promise<void> {
    const loginStatus = this.localStorage.getValue();
    if (loginStatus.isLoggedIn) {
      switch (loginStatus.authProvider) {
        case AuthProvider.google: {
          const ga = new GoogleAuthService(this.config.services.googleClientId);
          await ga.signOut();
          break;
        }
      }
    }
    this.localStorage.setValue({ isLoggedIn: false, authProvider: AuthProvider.none });
  }

  private getUserData(user: UserInfo) {
    const userData: UserData = {
      isLoggedIn: true,
      id: user.id,
      name: user.name,
      email: user.email,
      imageUrl: user.imageUrl,
      authProvider: AuthProvider.google
    };
    return userData;
  }
}

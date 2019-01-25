export enum AuthProvider {
  google = "google",
  none = "none"
}

export interface EnvState {
  isLoading: boolean;
  isLoggedIn: boolean;
  authProvider: AuthProvider;
  id: string;
  name: string;
  email: string;
  imageUrl: string;
}

export const defaultEnvState: EnvState = {
  isLoading: true,
  isLoggedIn: false,
  authProvider: AuthProvider.none,
  id: "",
  name: "",
  email: "",
  imageUrl: ""
};

export enum AuthProvider {
  google = "google",
  none = "none"
}

export interface UserState {
  isLoading: boolean;
  isLoggedIn: boolean;
  authProvider: AuthProvider;
  id: string;
  name: string;
  email: string;
  imageUrl: string;
}

export const defaultUserState: UserState = {
  isLoading: true,
  isLoggedIn: false,
  authProvider: AuthProvider.none,
  id: "",
  name: "",
  email: "",
  imageUrl: ""
};

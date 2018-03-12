export class UserInfo {
  id: string;
  attributes: UserAttributes;
}

export enum AuthProvider {
  google = "google",
  none = "none"
}

export class UserAttributes {
  constructor(public authProvider: AuthProvider, public name: string, public email: string, public imageUrl: string) {}
}

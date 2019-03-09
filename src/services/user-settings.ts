export interface UserSettings {
  turtleId: string;
  turtleSize: number;
  themeName: string;
  localeId: string;
}

export const defaultUserSettings: UserSettings = {
  turtleId: "",
  turtleSize: 40,
  themeName: "",
  localeId: "en"
};

export const locales = [{ name: "English", id: "en" }, { name: "Русский", id: "ru" }];

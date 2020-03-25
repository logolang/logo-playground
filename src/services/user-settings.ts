import { DEFAULT_LOCALE_ID } from "./constants";

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
  localeId: DEFAULT_LOCALE_ID
};

export const locales = [
  { name: "English", id: DEFAULT_LOCALE_ID },
  { name: "Русский", id: "ru" }
];

export interface UserSettings {
  turtleId: string;
  turtleSize: number;
  themeName: string;
  editorTheme: string;
  isDarkTheme: boolean;
  localeId: string;
  currentTutorialId: string;
  currentStepId: string;
}

export const defaultUserSettings: UserSettings = {
  turtleId: "tt12",
  turtleSize: 40,
  themeName: "default",
  editorTheme: "eclipse",
  isDarkTheme: false,
  localeId: "en",
  currentTutorialId: "01-basics",
  currentStepId: "01-intro"
};

export const locales = [{ name: "English", id: "en" }, { name: "Русский", id: "ru" }];

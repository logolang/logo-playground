export interface Theme {
  name: string;
  description: string;
  bodyClass: string;
  isDark: boolean;
  codeEditorThemeName: string;
  styleLinks: string[];
}

// Theme Manager is injected on index.html from 'themes-manager.js'
declare const themesManager: {
  themes: Theme[];
  setTheme(theme: Theme, isFirstTime: boolean): void;
  getCurrentTheme(): Theme;
  getThemeByName(themeName: string): Theme;
};

export function getAllThemes(): Theme[] {
  return themesManager.themes;
}

export function findTheme(themeName: string): Theme {
  return themesManager.getThemeByName(themeName);
}

export function setTheme(themeName: string) {
  themesManager.setTheme(findTheme(themeName), false);
}

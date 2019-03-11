export interface Theme {
  name: string;
  description: string;
  bodyClass: string;
  isDark: boolean;
  codeEditorThemeName: string;
  styleLinks: string[];
}

// Theme Manager is injected on index.html from 'themes-manager.js'
declare const themesManagerGlobalInstance: {
  themes: Theme[];
  setTheme(theme: Theme): void;
  getCurrentTheme(): Theme;
  getThemeByName(themeName?: string): Theme;
};

export const themesManager = themesManagerGlobalInstance;

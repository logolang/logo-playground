export interface Theme {
  name: string;
  description: string;
  bodyClass: string;
  isDark: boolean;
  codeEditorThemeName: string;
  styleLinks: string[];
}

// Theme Manager is injected on index.html from 'themes-manager.js'
declare const themeManager: any;

export function getAllThemes(): Theme[] {
  return themeManager.themes;
}

export function findTheme(themeName: string): Theme {
  const themes = getAllThemes();
  const selectedTheme = themes.find(t => t.name === themeName);
  if (selectedTheme) {
    return selectedTheme;
  }
  return themes[0];
}

export function setActiveTheme(themeName: string) {
  const activeTheme = getActiveTheme();
  if (activeTheme && activeTheme.name === themeName) {
    return;
  }
  themeManager.activateTheme(findTheme(themeName), false);
}

export function getActiveTheme(): Theme {
  return themeManager.getActiveTheme();
}

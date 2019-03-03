export interface Theme {
  name: string;
  description: string;
  bodyClass: string;
  isDark: boolean;
  codeEditorThemeName: string;
  styleLinks: string[];
}

const themeManager: any = (window as any).themeManager;

export function getAllThemes(): Theme[] {
  return themeManager.themes;
}

function findTheme(themeName: string): Theme {
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
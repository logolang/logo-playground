import { injectable } from "app/di";

export interface Theme {
  name: string;
  description: string;
  bodyClass: string;
  isDark: boolean;
  codeEditorThemeName: string;
  styleLinks: string[];
}

@injectable()
export class ThemesService {
  readonly themeManager: any = (window as any).themeManager;

  private readonly themes: Theme[] = [
    {
      name: "Litera",
      description: "The medium is the message",
      bodyClass: "is-light",
      isDark: false,
      codeEditorThemeName: "eclipse",
      styleLinks: [
        "content/css/bulma/litera/bulmaswatch.min.css",
        "content/css/codemirror/themes/eclipse.css",
        "content/css/golden-layout/goldenlayout-light-theme.css"
      ]
    },
    {
      name: "Materia",
      description: "Material is the metaphor",
      bodyClass: "is-light",
      isDark: false,
      codeEditorThemeName: "eclipse",
      styleLinks: [
        "content/css/bulma/materia/bulmaswatch.min.css",
        "content/css/codemirror/themes/eclipse.css",
        "content/css/golden-layout/goldenlayout-light-theme.css"
      ]
    },
    {
      name: "Yeti",
      description: "A friendly foundation",
      bodyClass: "is-light dark-navbar",
      isDark: false,
      codeEditorThemeName: "eclipse",
      styleLinks: [
        "content/css/bulma/yeti/bulmaswatch.min.css",
        "content/css/codemirror/themes/eclipse.css",
        "content/css/golden-layout/goldenlayout-light-theme.css"
      ]
    },
    {
      name: "Cosmo",
      description: "An ode to Metro",
      bodyClass: "is-light dark-navbar",
      isDark: false,
      codeEditorThemeName: "eclipse",
      styleLinks: [
        "content/css/bulma/cosmo/bulmaswatch.min.css",
        "content/css/codemirror/themes/eclipse.css",
        "content/css/golden-layout/goldenlayout-light-theme.css"
      ]
    },
    {
      name: "Flatly",
      description: "Flat and thick",
      bodyClass: "is-light dark-navbar",
      isDark: false,
      codeEditorThemeName: "eclipse",
      styleLinks: [
        "content/css/bulma/flatly/bulmaswatch.min.css",
        "content/css/codemirror/themes/eclipse.css",
        "content/css/golden-layout/goldenlayout-light-theme.css"
      ]
    },
    {
      name: "Pulse",
      description: "A trace of purple",
      bodyClass: "is-light dark-navbar",
      isDark: false,
      codeEditorThemeName: "eclipse",
      styleLinks: [
        "content/css/bulma/pulse/bulmaswatch.min.css",
        "content/css/codemirror/themes/eclipse.css",
        "content/css/golden-layout/goldenlayout-light-theme.css"
      ]
    },
    {
      name: "Sandstone",
      description: "A touch of warmth",
      bodyClass: "is-light dark-navbar",
      isDark: false,
      codeEditorThemeName: "eclipse",
      styleLinks: [
        "content/css/bulma/sandstone/bulmaswatch.min.css",
        "content/css/codemirror/themes/eclipse.css",
        "content/css/golden-layout/goldenlayout-light-theme.css"
      ]
    },
    {
      name: "Darkly",
      description: "Flatly in night-mode",
      bodyClass: "is-dark dark-navbar",
      isDark: true,
      codeEditorThemeName: "abcdef",
      styleLinks: [
        "content/css/bulma/darkly/bulmaswatch.min.css",
        "content/css/codemirror/themes/abcdef.css",
        "content/css/golden-layout/goldenlayout-dark-theme.css"
      ]
    },
    {
      name: "Superhero",
      description: "The brave and the blue",
      bodyClass: "is-dark dark-navbar",
      isDark: true,
      codeEditorThemeName: "abcdef",
      styleLinks: [
        "content/css/bulma/superhero/bulmaswatch.min.css",
        "content/css/codemirror/themes/abcdef.css",
        "content/css/golden-layout/goldenlayout-dark-theme.css"
      ]
    },
    {
      name: "Slate",
      description: "Shades of gunmetal gray",
      bodyClass: "is-dark dark-navbar",
      isDark: true,
      codeEditorThemeName: "abcdef",
      styleLinks: [
        "content/css/bulma/slate/bulmaswatch.min.css",
        "content/css/codemirror/themes/abcdef.css",
        "content/css/golden-layout/goldenlayout-dark-theme.css"
      ]
    },
    {
      name: "Nuclear",
      description: "A dark theme with irradiated highlights",
      bodyClass: "is-dark dark-navbar",
      isDark: true,
      codeEditorThemeName: "abcdef",
      styleLinks: [
        "content/css/bulma/nuclear/bulmaswatch.min.css",
        "content/css/codemirror/themes/abcdef.css",
        "content/css/golden-layout/goldenlayout-dark-theme.css"
      ]
    }
  ];

  getAllThemes() {
    return [this.themeManager.defaultTheme].concat(this.themes);
  }

  getTheme(themeName: string): Theme {
    const themes = this.getAllThemes();
    const selectedTheme = themes.find(t => t.name === themeName);
    if (selectedTheme) {
      return selectedTheme;
    }
    return themes[0];
  }

  setActiveTheme(themeName: string) {
    const activeTheme = this.getActiveTheme();
    if (activeTheme && activeTheme.name === themeName) {
      return;
    }
    this.themeManager.activateTheme(this.getTheme(themeName), false);
  }

  getActiveTheme(): Theme | undefined {
    return this.themeManager.getActiveTheme();
  }
}

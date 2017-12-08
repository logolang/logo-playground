import { injectable } from "app/di";

export interface Theme {
  name: string;
  description: string;
  isDark: boolean;
  codeEditorThemeName: string;
  styleLinks: string[];
}

@injectable()
export class ThemesService {
  private readonly themes: Theme[] = [
    {
      name: "Default",
      description: "Bulma as-is",
      isDark: false,
      codeEditorThemeName: "eclipse",
      styleLinks: [
        "content/css/bulma/default/bulmaswatch.min.css",
        "content/css/codemirror/themes/eclipse.css",
        "content/css/golden-layout/goldenlayout-light-theme.css"
      ]
    },
    {
      name: "Litera",
      description: "The medium is the message",
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
    return this.themes;
  }

  getTheme(themeName: string): Theme {
    const selectedTheme = this.themes.find(t => t.name === themeName);
    if (selectedTheme) {
      return selectedTheme;
    }
    return this.themes[0];
  }
}

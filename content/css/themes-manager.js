function ThemesManager(gitVersion) {
  var appThemeNameLocalStorageKey = "logo-playground.uitheme";

  this.themes = [
    {
      name: "Default",
      description: "Bulma as-is",
      bodyClass: "is-light",
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

  this.getThemeByName = function(themeName) {
    var theme = null;
    for (var i = 0; i < this.themes.length; ++i) {
      if (this.themes[i].name == themeName) {
        theme = this.themes[i];
        break;
      }
    }
    theme = theme || this.themes[0];
    return theme;
  };

  this.getCurrentTheme = function() {
    var themeName = window.localStorage.getItem(appThemeNameLocalStorageKey);
    return this.getThemeByName(themeName);
  };

  this.setTheme = function(theme) {
    window.localStorage.setItem(appThemeNameLocalStorageKey, theme.name);
    document.body.className = theme.bodyClass;
    injectCssLinks(theme.styleLinks, theme.name, function() {
      // remove old theme files
      var themeContainer = document.getElementById("THEME_CSS_CONTAINER");
      var themeLinks = themeContainer.querySelectorAll("[data-theme-name]");
      for (var i = 0; i < themeLinks.length; ++i) {
        if (themeLinks[i].getAttribute("data-theme-name") !== theme.name) {
          themeLinks[i].remove();
        }
      }
    });
  };

  function injectCssLinks(links, themeName, allLoadedCallback) {
    var linksToWait = links.length;
    for (var i = 0; i < links.length; ++i) {
      var linkUrl = links[i];
      var link = document.createElement("link");
      link.setAttribute("data-theme-name", themeName);
      link.setAttribute("rel", "stylesheet");
      link.setAttribute("type", "text/css");
      link.setAttribute("href", linkUrl + "?v=" + gitVersion);
      link.addEventListener("load", function() {
        --linksToWait;
        if (linksToWait == 0) {
          allLoadedCallback();
        }
      });
      var themeContainer = document.getElementById("THEME_CSS_CONTAINER");
      themeContainer.appendChild(link);
    }
  }

  // Initialize theme
  this.setTheme(this.getCurrentTheme());
}

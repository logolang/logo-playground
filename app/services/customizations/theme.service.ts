import { LocalStorageService } from "app/services/infrastructure/local-storage.service";

export interface Theme {
    name: string
    codemirror: string
    goldenlayout: string
    bootstrap: string
    isDark: boolean
}

export class ThemeService {
    private localStorageThemeStorage = new LocalStorageService<Theme | undefined>((window as any).appThemeNameLocalStorageKey, undefined);
    private readonly themes: Theme[] = [
        {
            name: 'Default',
            isDark: false,
            bootstrap: 'default',
            codemirror: 'eclipse',
            goldenlayout: 'light'
        },
        {
            name: 'Yeti',
            isDark: false,
            bootstrap: 'yeti',
            codemirror: 'eclipse',
            goldenlayout: 'light'
        },
        {
            name: 'Darkly',
            isDark: true,
            bootstrap: 'darkly',
            codemirror: 'abcdef',
            goldenlayout: 'dark'
        },
        {
            name: 'Cerulean',
            isDark: false,
            bootstrap: 'cerulean',
            codemirror: 'eclipse',
            goldenlayout: 'light'
        },
        {
            name: 'Slate',
            isDark: true,
            bootstrap: 'slate',
            codemirror: 'abcdef',
            goldenlayout: 'dark'
        },
    ]

    getAllThemes() {
        return this.themes;
    }

    setTheme(theme: Theme): void {
        this.localStorageThemeStorage.setValue(theme);
    }

    getCurrentTheme(): Theme {
        const selectedTheme = this.localStorageThemeStorage.getValue();
        if (selectedTheme) {
            return selectedTheme;
        }
        return this.themes[0];
    }
}
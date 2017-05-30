import { LocalStorageService } from "app/services/infrastructure/local-storage.service";
import { injectable } from "app/di";

export interface Theme {
    name: string
    codemirror: string
    goldenlayout: string
    bootstrap: string
    isDark: boolean
}

@injectable()
export class ThemeCustomizationsService {
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

    getTheme(themeName: string): Theme {
        const selectedTheme = this.themes.find(t => t.name === themeName);
        if (selectedTheme) {
            return selectedTheme;
        }
        return this.themes[0];
    }
}
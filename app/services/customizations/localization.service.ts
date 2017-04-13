import * as Jed from "jed"
import * as po2json from "po2json/lib/parse"

export interface ILocaleInfo {
    name: string
    id: string
}

const supportedLocales: ILocaleInfo[] = [
    {
        name: 'English',
        id: 'en'
    },
    {
        name: 'Русский',
        id: 'ru'
    }
]

let i18n: any; // Jed onject

export function T(messageKey: string): string {
    if (i18n) {
        return i18n.translate(messageKey).fetch();
    }
    throw new Error('Locale data is not initialized yet');
}

export class LocalizationService {
    getSupportedLocales(): ILocaleInfo[] {
        return supportedLocales;
    }

    getLocaleById(id: string): ILocaleInfo {
        const matched = supportedLocales.find(l => l.id === id);
        return matched || supportedLocales[0];
    }

    initLocale(poFileContent: string): void {
        const localeData = po2json(poFileContent, { format: 'jed1.x' });
        i18n = new Jed(localeData);
    }
}
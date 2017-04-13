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

export interface ITranslationOptions {
    plural?: string
    value?: any;
}

/**
 * Function to perform localization for messages. It is a wrapper around Jed library.
 * http://messageformat.github.io/Jed/
 * @param messageKey
 * @param options 
 */
export function _T(messageKey: string, options?: ITranslationOptions): string {
    if (i18n) {
        let chain = i18n.translate(messageKey);
        if (options) {
            if (options.plural) {
                if (options.value === undefined) {
                    throw new Error('value is a required parameter if you have plural');
                }
                if (typeof (options.value) != 'number') {
                    throw new Error('value should be a number if you have plural');
                }
                chain = chain.ifPlural(options.value, options.plural);
            }
        }

        if (options && options.value !== undefined) {
            return chain.fetch(options.value);
        } else {
            return chain.fetch();
        }
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
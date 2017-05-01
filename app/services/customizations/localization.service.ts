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

type ValueType = string | number;

export interface ITranslationOptions {
    plural?: string
    value?: ValueType;
    values?: ValueType[];
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
        let values: ValueType[] = [];
        if (options) {
            if (options.value !== undefined) {
                values = [options.value];
            }
            if (options.values) {
                values = [...values, ...options.values];
            }
            if (options.plural) {
                if (values.length === 0) {
                    throw new Error('value is a required parameter if you have plural');
                }
                chain = chain.ifPlural(values[0], options.plural);
            }
        }
        return chain.fetch(...values);
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
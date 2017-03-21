import { IAjaxService } from "app/services/infrastructure/ajax-service";
import { stay } from "app/utils/async-helpers";

type DictionaryLike<V> = { [name: string]: V };

export interface ILocalizedContentLoader {
    getFileContent(relativePath: string): Promise<string>
}

/**
 * Loads requested files by ajax from content directory using provided locale
 */
export class LocalizedContentLoader implements ILocalizedContentLoader {
    private cache: DictionaryLike<string> = {};

    constructor(private ajax: IAjaxService) {
    }

    async getFileContent(relativePath: string): Promise<string> {
        //await stay(2000);
        const fromCache = this.cache[relativePath];
        if (fromCache) {
            return fromCache;
        }
        try {
            let result = await this.ajax.getText('content/en/' + relativePath);
            this.cache[relativePath] = result;
            return result;
        }
        catch (ex) {
            throw ex;
        }
    }
}
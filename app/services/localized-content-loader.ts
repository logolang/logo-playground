import { IAjaxService } from './infrastructure/ajax-service';

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
        const fromCache = this.cache[relativePath];
        if (fromCache) {
            return fromCache;
        }
        try {
            let result = await this.ajax.ajax<string>('content/en/' + relativePath, "get", undefined, true);
            this.cache[relativePath] = result;
            return result;
        }
        catch (ex) {
            throw ex;
        }
    }
}
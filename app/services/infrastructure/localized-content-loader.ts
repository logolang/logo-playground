import { injectable, inject } from "app/di";
import { IAjaxService } from "app/services/infrastructure/ajax-service";
import { stay } from "app/utils/async-helpers";

type DictionaryLike<V> = { [name: string]: V };

export abstract class ILocalizedContentLoader {
    abstract getFileContent(relativePath: string): Promise<string>
}

@injectable()
/**
 * Loads requested files by ajax from content directory using provided locale
 */
export class LocalizedContentLoader implements ILocalizedContentLoader {
    private cache: DictionaryLike<string> = {};

    constructor(
        private ajax: IAjaxService,
        private localeId: string
    ) {
    }

    async getFileContent(relativePath: string): Promise<string> {
        //await stay(2000);
        const resKey = `${this.localeId}:${relativePath}`;
        const fromCache = this.cache[resKey];
        if (fromCache) {
            return fromCache;
        }
        try {
            let result = await this.ajax.getText(`content/${this.localeId}/${relativePath}`);
            this.cache[resKey] = result;
            return result;
        }
        catch (ex) {
            throw ex;
        }
    }
}
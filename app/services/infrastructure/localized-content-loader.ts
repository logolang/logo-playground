import { injectable } from "app/di";
import { IAjaxService } from "app/services/infrastructure/ajax-service";

type DictionaryLike<V> = { [name: string]: V };

export abstract class ILocalizedContentLoader {
  abstract getFileContent(relativePath: string): Promise<string>;
}

/**
 * Loads requested files by ajax from content directory using provided locale
 */
@injectable()
export class LocalizedContentLoader implements ILocalizedContentLoader {
  private cache: DictionaryLike<string> = {};

  constructor(private ajax: IAjaxService, private localeId: string) {}

  async getFileContent(relativePath: string): Promise<string> {
    //await stay(2000);
    const resKey = `${this.localeId}:${relativePath}`;
    const fromCache = this.cache[resKey];
    if (fromCache) {
      return fromCache;
    }
    try {
      const result = await this.ajax.getText(`content/${this.localeId}/${relativePath}`);
      this.cache[resKey] = result;
      return result;
    } catch (ex) {
      throw ex;
    }
  }
}

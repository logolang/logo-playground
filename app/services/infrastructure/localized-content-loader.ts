import { DictionaryLike } from "app/utils/syntax";

/**
 * Loads requested files by ajax from content directory using provided locale
 */
export class LocalizedContentLoader {
  private cache: DictionaryLike<string> = {};

  constructor(private localeId: string) {}

  async getFileContent(relativePath: string): Promise<string> {
    try {
      const content = await this.getContentByLocale(this.localeId, relativePath);
      return content;
    } catch (ex) {
      console.log("Failed to load localized version, falling back to English");
      return this.getContentByLocale("en", relativePath);
    }
  }

  private async getContentByLocale(locale: string, relativePath: string): Promise<string> {
    const resKey = `${this.localeId}:${relativePath}`;
    const fromCache = this.cache[resKey];
    if (fromCache) {
      return fromCache;
    }
    try {
      const result = await fetch(`content/${locale}/${relativePath}`, {
        method: "get",
        credentials: "same-origin"
      });
      if (!result.ok) {
        throw result;
      }
      const content = await result.text();
      this.cache[resKey] = content;
      return content;
    } catch (ex) {
      throw ex;
    }
  }
}

import { DictionaryLike } from "utils/syntax";
import { DEFAULT_LOCALE_ID } from "./constants";

/**
 * Loads requested files by ajax from content directory using provided locale
 */
export class LocalizedContentLoader {
  private cache: DictionaryLike<string> = {};

  constructor(private localeId: string) {}

  async loadFile(url: string, options: { useLocale: boolean }): Promise<string> {
    try {
      const content = await this.loadContentByLocale(
        url,
        options.useLocale ? this.localeId : DEFAULT_LOCALE_ID
      );
      return content;
    } catch (ex) {
      console.log("Failed to load localized version, falling back to English");
      return this.loadContentByLocale(url, DEFAULT_LOCALE_ID);
    }
  }

  getCurrentLocaleId() {
    return this.localeId;
  }

  private async loadContentByLocale(url: string, localeId: string): Promise<string> {
    if (localeId && localeId !== DEFAULT_LOCALE_ID) {
      const parts = url.split(".");
      parts.splice(parts.length - 1, 0, localeId);
      url = parts.join(".");
    }

    const fromCache = this.cache[url];
    if (fromCache) {
      return fromCache;
    }

    const result = await fetch(url, {
      method: "get",
      credentials: "same-origin"
    });

    if (!result.ok) {
      throw result;
    }

    const content = await result.text();
    this.cache[url] = content;
    return content;
  }
}

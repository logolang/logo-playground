import { debounce } from "app/utils/debounce";
import { localStoragePrefix } from "app/services/constants";
import { LocalStorage } from "app/services/infrastructure/local-storage";

/**
 * This service is to store and get user temporary code stored in local browser
 * So this data is designed as not be to synchronized to whatever backend whenever
 * This data is persisted only in current browser
 */

export class LocalPlaygroundCodeStorage {
  private localStorage: LocalStorage<string>;

  constructor(userEmail: string) {
    const storageKey = localStoragePrefix + "playground-code:" + (userEmail || "guest");
    this.localStorage = new LocalStorage<string>(storageKey, "");
  }

  private writeToStorage = debounce((code: string) => {
    this.localStorage.setValue(code || "");
  }, 500);

  getCode(): string {
    const value = this.localStorage.getValue();
    return value || "";
  }

  setCode(code: string): void {
    this.writeToStorage(code);
  }
}

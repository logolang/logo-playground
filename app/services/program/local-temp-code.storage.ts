import { debounce } from "app/utils/debounce";

/**
 * This service is to store and get user temporary code stored in local browser
 * So this data is designed as not be to synchronized to whatever backend whenever
 * This data is persisted only in current browser
 */

export class LocalTempCodeStorage {
  private storagePrefix = "";

  private writeToStorage = debounce((id: string, code: string) => {
    console.log("code is written, yo!");
    localStorage.setItem(this.storagePrefix + id, code || "");
  }, 500);

  constructor(userEmail: string) {
    const userId = userEmail || "guest";
    this.storagePrefix = "logo-playground.temp-code:" + userId + ":";
  }

  getCode(id: string): string {
    const value = localStorage.getItem(this.storagePrefix + id);
    return value || "";
  }

  setCode(id: string, code: string): void {
    this.writeToStorage(id, code);
  }
}

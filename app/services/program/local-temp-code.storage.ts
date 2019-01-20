import { injectable, inject } from "app/di";
import { CurrentUserService } from "app/services/login/current-user.service";

/**
 * This service is to store and get user temporary code stored in local browser
 * So this data is designed as not be to synchronized to whatever backend whenever
 * This data is persisted only in current browser
 */
@injectable()
export class LocalTempCodeStorage {
  private storagePrefix = "";
  private timerHandle: NodeJS.Timeout | undefined;
  private id: string | undefined;
  private code: string | undefined;

  constructor(@inject(CurrentUserService) private currentUser: CurrentUserService) {
    const userId = this.currentUser.getLoginStatus().userInfo.attributes.email || "guest";
    this.storagePrefix = "logo-playground.temp-code:" + userId + ":";
  }

  getCode(id: string): string {
    const value = localStorage.getItem(this.storagePrefix + id);
    return value || "";
  }

  setCode(id: string, code: string): void {
    if (this.timerHandle) {
      clearTimeout(this.timerHandle);
      this.timerHandle = undefined;
    }
    this.id = id;
    this.code = code;
    this.timerHandle = setTimeout(this.writeToStorage, 1000);
  }

  private writeToStorage = () => {
    localStorage.setItem(this.storagePrefix + this.id, this.code || "");
    console.log("written");
    this.timerHandle = undefined;
  };
}

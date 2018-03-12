import { injectable, inject } from "app/di";
import { ICurrentUserService } from "app/services/login/current-user.service";

export abstract class ILocalTempCodeStorage {
  abstract getCode(id: string): Promise<string>;
  abstract setCode(id: string, code: string): Promise<void>;
}

/**
 * This service is to store and get user temporary code stored in local browser
 * So this data is designed as not be to synchronized to whatever backend whenever
 * This data is persisted only in current browser
 */
@injectable()
export class LocalTempCodeStorage implements ILocalTempCodeStorage {
  private storagePrefix: string = "";
  constructor(@inject(ICurrentUserService) private currentUser: ICurrentUserService) {
    const userId = this.currentUser.getLoginStatus().userInfo.id;
    this.storagePrefix = "logo-playground.temp-code." + userId + ".";
  }

  async getCode(id: string): Promise<string> {
    const value = localStorage.getItem(this.storagePrefix + id);
    return value || "";
  }

  async setCode(id: string, code: string): Promise<void> {
    localStorage.setItem(this.storagePrefix + id, code);
  }
}

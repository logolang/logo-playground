import { RandomHelper } from "app/utils/random-helper";
import { IAjaxService } from "app/services/infrastructure/ajax-service";
import { AppConfig } from "app/services/config/app-config";

export class AppConfigLoader {
  constructor(private ajaxService: IAjaxService) {}

  async loadData(): Promise<AppConfig> {
    const config = (await this.ajaxService.ajax(
      `content/config/config.json?${RandomHelper.getRandomObjectId(20)}`,
      "get"
    )) as AppConfig;

    return config;
  }
}

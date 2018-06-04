import { RandomHelper } from "app/utils/random-helper";
import { AjaxService } from "app/services/infrastructure/ajax-service";
import { AppConfig } from "app/services/config/app-config";

export class AppConfigLoader {
  constructor(private ajaxService: AjaxService) {}

  async loadData(): Promise<AppConfig> {
    const config = (await this.ajaxService.ajax(
      `content/config/config.json?${RandomHelper.getRandomObjectId(20)}`,
      "get"
    )) as AppConfig;

    return config;
  }
}

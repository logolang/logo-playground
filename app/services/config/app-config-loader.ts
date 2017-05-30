import { RandomHelper } from 'app/utils/random-helper';
import { IAjaxService } from "app/services/infrastructure/ajax-service";
import { AppConfig } from "app/services/config/app-config";

export class AppConfigLoader {
    private cache = new Map<string, string>();

    constructor(private ajaxService: IAjaxService) {
    }

    async loadData(): Promise<AppConfig> {
        const configData = await this.ajaxService.ajax(`content/config/config.json?${RandomHelper.getRandomObjectId(20)}`, 'get');
        const config = AppConfig.buildFromConfigData(configData);
        return config;
    }
}
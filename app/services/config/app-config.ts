import * as tv4 from 'tv4';
import { injectable } from "app/di";
const appConfigSchema = require('app/../content/config/config.schema.json');

/**
 * This classes are describing configuration schema
 * The schema is located in ../config.schema.json
 */

export interface IAppServicesDetails {
    appApiUrl: string
    imgurServiceUrl: string
    imgurServiceClientID: string
}

@injectable()
export class AppConfig {
    services: IAppServicesDetails

    public static buildFromConfigData(configFile: any): AppConfig {
        let appConfig = configFile as AppConfig;
        AppConfig.setDefaultValues(appConfig);
        AppConfig.validate(appConfig);
        return appConfig;
    }

    /**
     * This function is walking through config objects and fills them with default values. 
     */
    private static setDefaultValues(appConfig: AppConfig) {
        // initialize optional elements:
        // not yet
    }

    /**
     * This function checks that configuration is conforming to schema
     */
    private static validate(appConfig: AppConfig) {
        const validationResult = tv4.validateMultiple(appConfig, appConfigSchema);
        if (!validationResult.valid) {
            const messages = validationResult.errors.map(error => `Error message: "${error.message}". Data path: "${error.dataPath}".`);
            throw new Error(`Application configuration file is not conforming to the schema.\r\n${messages.join('\r\n')}`);
        }
    }
}
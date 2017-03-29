import { ICurrentUserProvider } from "app/services/login/current-user.provider";
import { AppConfig } from "app/services/config/app-config";
import { IAppConfigLoader } from "app/services/config/app-config-loader";
import { ILoginService } from "app/services/login/login.service";
import { IUsersRepository } from "app/services/login/users.repository";
import { IProgramsRepository } from "app/services/gallery/personal-gallery-localstorage.repository";
import { ILocalizedContentLoader } from "app/services/infrastructure/localized-content-loader";
import { ITutorialsContentService } from "app/services/tutorials/tutorials-content-service";
import { IUserDataService } from "app/services/customizations/user-data.service";
import { IUserSettingsService } from "app/services/customizations/user-settings.service";

interface ServicesList {
    currentUser: ICurrentUserProvider
    appConfig: AppConfig
    configLoader: IAppConfigLoader
    loginService: ILoginService
    userDataService: IUserDataService
    userSettingsService: IUserSettingsService
    usersRepository: IUsersRepository
    programsReporitory: IProgramsRepository
    contentLoader: ILocalizedContentLoader
    tutorialsService: ITutorialsContentService
}

/**
 * Service locator to store dependencies in global variable.
 */
export class ServiceLocator {
    private static services: ServicesList = {} as any;

    /**
     * Used to register dependency in service locator.
     * Example:
     * ```
     * ServiceLocator.set(x => x.platformService = platformService);
     * ```
     */
    public static set(setter: (x: ServicesList) => void) {
        setter(ServiceLocator.services);
    }

    /**
     * Used to safely resolve dependency from Service locator.
     * It will check dependency to be defined and throw an Error if it is falsy.
     * Example:
     * ``` 
     * let conf = ServiceLocator.resolve(x => x.appConfig);
     * ```
     */
    public static resolve<T>(getter: (x: ServicesList) => T): T {
        const res = getter(ServiceLocator.services);
        if (!res) {
            throw new Error(`Cant resolve ${getter.toString()}`);
        }
        return res;
    }
}
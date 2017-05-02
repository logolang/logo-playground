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
import { INotificationService } from "app/services/infrastructure/notification.service";
import { ITitleService } from "app/services/infrastructure/title.service";
import { INavigationService } from "app/services/infrastructure/navigation.service";
import { ImageUploadService } from "app/services/infrastructure/image-upload-imgur.service";

interface ServicesList {
    currentUser: ICurrentUserProvider
    appConfig: AppConfig
    configLoader: IAppConfigLoader
    loginService: ILoginService
    userDataService: IUserDataService
    userSettingsService: IUserSettingsService
    notificationService: INotificationService
    navigationService: INavigationService
    titleService: ITitleService
    usersRepository: IUsersRepository
    programsReporitory: IProgramsRepository
    contentLoader: ILocalizedContentLoader
    tutorialsService: ITutorialsContentService
    imageUploadService: ImageUploadService
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
import { ITutorialsContentService } from './tutorials-content-service';
import { ILocalizedContentLoader } from './localized-content-loader';
import { IProgramsRepository } from './entities/programs-localstorage.repository';
import { IUsersRepository } from './entities/users.repository';
import { ICurrentUserProvider } from './current-user.provider';
import { IAppConfigLoader } from './app-config-loader';
import { ILoginService } from './login.service';
import { AppConfig } from '../model/config/app-config';

interface ServicesList {
    currentUser: ICurrentUserProvider
    appConfig: AppConfig
    configLoader: IAppConfigLoader
    loginService: ILoginService
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
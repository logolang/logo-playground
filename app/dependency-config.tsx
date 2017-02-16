import { TutorialsContentService } from './services/tutorials-content-service';
import { LocalizedContentLoader } from './services/localized-content-loader';
import { ProgramsLocalStorageRepository } from './services/entities/programs-localstorage.repository';
import { ServiceLocator } from 'app/services/service-locator'

import { AjaxService } from 'app/services/infrastructure/ajax-service';
import { AppConfigLoader } from 'app/services/app-config-loader';
import { CurrentUserProvider } from './services/current-user.provider';

import { FakeLoginService } from 'app/services/login.service.fake';
import { FakeUsersRepository } from 'app/services/entities/users.repository.fake';

export class DependencyConfig {
    static async init() {
        // Construct all required services
        const ajaxService = new AjaxService();
        const confLoader = new AppConfigLoader(ajaxService);
        const appConfig = await confLoader.loadData();

        const currentUser = new CurrentUserProvider();
        const usersRepository = new FakeUsersRepository(currentUser);

        const loginService = new FakeLoginService();
        const contentLoader = new LocalizedContentLoader(ajaxService);
        const tutorialsService = new TutorialsContentService(contentLoader);

        // Setup the global dependency injection container
        ServiceLocator.set(x => x.configLoader = confLoader);
        ServiceLocator.set(x => x.appConfig = appConfig);
        ServiceLocator.set(x => x.currentUser = currentUser);
        ServiceLocator.set(x => x.usersRepository = usersRepository);
        ServiceLocator.set(x => x.loginService = loginService);

        ServiceLocator.set(x => x.contentLoader = contentLoader);
        ServiceLocator.set(x => x.programsReporitory = new ProgramsLocalStorageRepository(currentUser));
        ServiceLocator.set(x => x.tutorialsService = tutorialsService);
    }
}
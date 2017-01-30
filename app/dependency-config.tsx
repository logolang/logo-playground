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

        // Setup the global dependency injection container
        ServiceLocator.set(x => x.configLoader = confLoader);
        ServiceLocator.set(x => x.appConfig = appConfig);
        ServiceLocator.set(x => x.currentUser = currentUser);
        ServiceLocator.set(x => x.usersRepository = usersRepository);
        ServiceLocator.set(x => x.loginService = loginService);
    }
}
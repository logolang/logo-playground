import { ServiceLocator } from 'app/services/service-locator'
import { AjaxService } from 'app/services/infrastructure/ajax-service';
import { AppConfigLoader } from "app/services/config/app-config-loader";
import { CurrentUserProvider } from "app/services/login/current-user.provider";
import { LocalizedContentLoader } from "app/services/infrastructure/localized-content-loader";
import { TutorialsContentService } from "app/services/tutorials/tutorials-content-service";
import { ProgramsLocalStorageRepository } from "app/services/gallery/personal-gallery-localstorage.repository";
import { FakeLoginService } from "app/services/login/login.service.fake";
import { FakeUsersRepository } from "app/services/login/users.repository.fake";
import { UserDataBrowserLocalStorageService } from "app/services/customizations/user-data.service";
import { UserSettingsBrowserLocalStorageService } from "app/services/customizations/user-settings.service";
import { NotificationService } from "app/services/infrastructure/notification.service";
import { TitleService } from "app/services/infrastructure/title.service";
import { LocalizationService } from "app/services/customizations/localization.service";

export class DependencyConfig {
    static async init() {
        // Construct all required services
        const ajaxService = new AjaxService();
        const confLoader = new AppConfigLoader(ajaxService);
        const appConfig = await confLoader.loadData();

        const currentUser = new CurrentUserProvider();
        const userDataService = new UserDataBrowserLocalStorageService('TBD');
        const userSettingsService = new UserSettingsBrowserLocalStorageService('TBD');
        const userSettings = await userSettingsService.get();

        const localizationService = new LocalizationService();
        const localeInfo = localizationService.getLocaleById(userSettings.localeId);
        const contentLoader = new LocalizedContentLoader(ajaxService, localeInfo.id);
        const localizationData = await contentLoader.getFileContent('messages.po');
        localizationService.initLocale(localizationData);

        const notificationService = new NotificationService();
        const titleService = new TitleService(appInfo.description + ": ");

        const usersRepository = new FakeUsersRepository(currentUser);

        const loginService = new FakeLoginService();
        const tutorialsService = new TutorialsContentService(contentLoader);

        // Setup the global dependency injection container
        ServiceLocator.set(x => x.configLoader = confLoader);
        ServiceLocator.set(x => x.appConfig = appConfig);
        ServiceLocator.set(x => x.currentUser = currentUser);
        ServiceLocator.set(x => x.userDataService = userDataService);
        ServiceLocator.set(x => x.userSettingsService = userSettingsService);
        ServiceLocator.set(x => x.notificationService = notificationService);
        ServiceLocator.set(x => x.titleService = titleService);

        ServiceLocator.set(x => x.usersRepository = usersRepository);
        ServiceLocator.set(x => x.loginService = loginService);

        ServiceLocator.set(x => x.contentLoader = contentLoader);
        ServiceLocator.set(x => x.programsReporitory = new ProgramsLocalStorageRepository(currentUser));
        ServiceLocator.set(x => x.tutorialsService = tutorialsService);
    }
}
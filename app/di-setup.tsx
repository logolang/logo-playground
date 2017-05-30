import { container } from "app/di";

import { AjaxService, IAjaxService } from 'app/services/infrastructure/ajax-service';
import { AppConfigLoader } from "app/services/config/app-config-loader";
import { CurrentUserProvider, ICurrentUserProvider } from "app/services/login/current-user.provider";
import { LocalizedContentLoader, ILocalizedContentLoader } from "app/services/infrastructure/localized-content-loader";
import { TutorialsContentService, ITutorialsContentService } from "app/services/tutorials/tutorials-content-service";
import { ProgramsLocalStorageRepository } from "app/services/gallery/personal-gallery-localstorage.repository";
import { UserDataBrowserLocalStorageService, IUserDataService } from "app/services/customizations/user-data.service";
import { UserSettingsBrowserLocalStorageService, IUserSettingsService } from "app/services/customizations/user-settings.service";
import { NotificationService, INotificationService } from "app/services/infrastructure/notification.service";
import { TitleService } from "app/services/infrastructure/title.service";
import { LocalizationService, _T } from "app/services/customizations/localization.service";
import { NavigationService, INavigationService } from "app/services/infrastructure/navigation.service";
import { ImageUploadImgurService, ImageUploadService } from "app/services/infrastructure/image-upload-imgur.service";
import { IAppInfo } from "app/services/infrastructure/app-info";
import { AppConfig } from "app/services/config/app-config";
import { ThemeCustomizationsService } from "app/services/customizations/theme-customizations.service";
import { TurtleCustomizationsService } from "app/services/customizations/turtle-customizations.service";
import { UserCustomizationsProvider } from "app/services/customizations/user-customizations-provider";
import { ProgramsSamplesRepository } from "app/services/gallery/gallery-samples.repository";

export class DependecyInjectionSetup {
    static async setup() {
        const appInfo: IAppInfo = APP_WEBPACK_STATIC_INFO /*Global variable injected by Webpack*/;

        container.bind(IAjaxService).to(AjaxService);
        container.bind(IAppInfo).toConstantValue(appInfo);

        const appConfigLoader = new AppConfigLoader(container.get(IAjaxService));
        const appConfig = await appConfigLoader.loadData();
        container.bind(AppConfig).toConstantValue(appConfig);

        //TODO: use google API key from config file
        const currentUser = new CurrentUserProvider("388088822786-2okb2ch7pov7d6oqk8chrq33u0ed0kfr.apps.googleusercontent.com");
        const status = await currentUser.init();
        console.log('Hello', status);
        container.bind(ICurrentUserProvider).toConstantValue(currentUser);

        container.bind(IUserDataService).to(UserDataBrowserLocalStorageService);
        container.bind(IUserSettingsService).to(UserSettingsBrowserLocalStorageService);

        const userSettings = await container.get(IUserSettingsService).get();

        const contentLoader = new LocalizedContentLoader(container.get(IAjaxService), userSettings.localeId);
        container.bind(ILocalizedContentLoader).toConstantValue(contentLoader);

        const localizationData = await contentLoader.getFileContent('messages.po');
        const localizationService = new LocalizationService();
        localizationService.initLocale(localizationData);
        container.bind(LocalizationService).toConstantValue(localizationService);

        container.bind(INotificationService).to(NotificationService);
        container.bind(INavigationService).to(NavigationService);

        const titleService = new TitleService(_T("App title"));
        container.bind(TitleService).toConstantValue(titleService);

        container.bind(ITutorialsContentService).to(TutorialsContentService);

        const imageUploadService = new ImageUploadImgurService(appConfig.services.imgurServiceClientID, appConfig.services.imgurServiceUrl);
        container.bind(ImageUploadService).toConstantValue(imageUploadService);

        container.bind(ThemeCustomizationsService).to(ThemeCustomizationsService);
        container.bind(TurtleCustomizationsService).to(TurtleCustomizationsService);
        container.bind(UserCustomizationsProvider).to(UserCustomizationsProvider);

        container.bind(ProgramsLocalStorageRepository).to(ProgramsLocalStorageRepository);
        container.bind(ProgramsSamplesRepository).to(ProgramsSamplesRepository);
    }
}
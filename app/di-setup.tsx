import { container } from "app/di";

import { AjaxService, IAjaxService } from "app/services/infrastructure/ajax-service";
import { AppConfigLoader } from "app/services/config/app-config-loader";
import { CurrentUserService, ICurrentUserService } from "app/services/login/current-user.service";
import { LocalizedContentLoader, ILocalizedContentLoader } from "app/services/infrastructure/localized-content-loader";
import { TutorialsContentService, ITutorialsContentService } from "app/services/tutorials/tutorials-content-service";
import { ProgramsLocalStorageRepository } from "app/services/gallery/personal-gallery-localstorage.repository";
import { LocalTempCodeStorage, ILocalTempCodeStorage } from "app/services/program/local-temp-code.storage";
import {
  UserSettingsBrowserLocalStorageService,
  IUserSettingsService
} from "app/services/customizations/user-settings.service";
import { NotificationService, INotificationService } from "app/services/infrastructure/notification.service";
import { TitleService } from "app/services/infrastructure/title.service";
import { LocalizationService, _T } from "app/services/customizations/localization.service";
import { NavigationService, INavigationService } from "app/services/infrastructure/navigation.service";
import { ImageUploadImgurService, ImageUploadService } from "app/services/infrastructure/image-upload-imgur.service";
import { IAppInfo } from "app/services/infrastructure/app-info";
import { AppConfig } from "app/services/config/app-config";
import { ThemesService } from "app/services/customizations/themes.service";
import { TurtlesService } from "app/services/customizations/turtles.service";
import { ProgramsSamplesRepository } from "app/services/gallery/gallery-samples.repository";
import { GoogleAuthService } from "app/services/login/google-auth.service";
import { LoginService, ILoginService } from "app/services/login/login.service";

export class DependecyInjectionSetup {
  static async setup() {
    const appInfo: IAppInfo = APP_WEBPACK_STATIC_INFO /*Global variable injected by Webpack*/;

    container.bind(IAjaxService).to(AjaxService);
    container.bind(IAppInfo).toConstantValue(appInfo);

    const appConfigLoader = new AppConfigLoader(container.get(IAjaxService));
    const appConfig = await appConfigLoader.loadData();
    container.bind(AppConfig).toConstantValue(appConfig);

    container.bind(ICurrentUserService).to(CurrentUserService);
    //TODO: use google API key from config file
    const authService = new GoogleAuthService(
      "388088822786-2okb2ch7pov7d6oqk8chrq33u0ed0kfr.apps.googleusercontent.com"
    );
    const loginService = new LoginService(authService, container.get(ICurrentUserService));
    container.bind(ILoginService).toConstantValue(loginService);
    await loginService.tryLoginUserAutomatically();

    container.bind(IUserSettingsService).to(UserSettingsBrowserLocalStorageService);
    const userSettings = await container.get(IUserSettingsService).get();

    container.bind(ILocalTempCodeStorage).to(LocalTempCodeStorage);

    const contentLoader = new LocalizedContentLoader(container.get(IAjaxService), userSettings.localeId);
    container.bind(ILocalizedContentLoader).toConstantValue(contentLoader);

    const localizationData = await contentLoader.getFileContent("messages.po");
    const localizationService = new LocalizationService();
    localizationService.initLocale(localizationData);
    container.bind(LocalizationService).toConstantValue(localizationService);

    container.bind(INotificationService).to(NotificationService);
    container.bind(INavigationService).to(NavigationService);

    const titleService = new TitleService(_T("App title"));
    container.bind(TitleService).toConstantValue(titleService);

    container.bind(ITutorialsContentService).to(TutorialsContentService);

    const imageUploadService = new ImageUploadImgurService(
      appConfig.services.imgurServiceClientID,
      appConfig.services.imgurServiceUrl
    );
    container.bind(ImageUploadService).toConstantValue(imageUploadService);

    container.bind(ThemesService).to(ThemesService);
    container.bind(TurtlesService).to(TurtlesService);

    container.bind(ProgramsLocalStorageRepository).to(ProgramsLocalStorageRepository);
    container.bind(ProgramsSamplesRepository).to(ProgramsSamplesRepository);
  }
}

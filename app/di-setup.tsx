import { container } from "app/di";
import { normalizeError } from "app/utils/error-helpers";

import { AjaxService, IAjaxService } from "app/services/infrastructure/ajax-service";
import { AppConfigLoader } from "app/services/config/app-config-loader";
import { CurrentUserService, ICurrentUserService } from "app/services/login/current-user.service";
import { LocalizedContentLoader, ILocalizedContentLoader } from "app/services/infrastructure/localized-content-loader";
import { TutorialsContentService, ITutorialsContentService } from "app/services/tutorials/tutorials-content-service";
import {
  ProgramsLocalStorageRepository,
  IUserLibraryRepository
} from "app/services/gallery/personal-gallery-localstorage.repository";
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
import { GallerySamplesRepository, IGallerySamplesRepository } from "app/services/gallery/gallery-samples.repository";
import { GoogleAuthService } from "app/services/login/google-auth.service";
import { LoginService, ILoginService } from "app/services/login/login.service";
import { ProgramManagementService } from "app/services/program/program-management.service";
import { TutorialsCodeRepository, ITutorialsSamplesRepository } from "app/services/tutorials/tutorials-code.repository";
import { GistSharedProgramsRepository } from "app/services/program/gist-shared-programs.repository";
import { AuthProvider } from "app/services/login/user-info";
import { ProgramsGoogleDriveRepository } from "app/services/gallery/personal-gallery-googledrive.repository";
import {
  IEventsTrackingService,
  EventsTrackingService,
  EventAction
} from "app/services/infrastructure/events-tracking.service";
import { GoogleAnalyticsTrackerService } from "app/services/infrastructure/google-analytics-tracker.service";

export class DependecyInjectionSetup {
  static async setup() {
    const appInfo: IAppInfo = APP_WEBPACK_STATIC_INFO /*Global variable injected by Webpack*/;

    container.bind(IAjaxService).to(AjaxService);
    container.bind(IAppInfo).toConstantValue(appInfo);

    const appConfigLoader = new AppConfigLoader(container.get(IAjaxService));
    const appConfig = await appConfigLoader.loadData();
    container.bind(AppConfig).toConstantValue(appConfig);

    const eventsTrackingService = new EventsTrackingService();
    const googleTracking = new GoogleAnalyticsTrackerService();
    eventsTrackingService.subscribe(event => {
      googleTracking.trackEvent(event);
    });
    container.bind(IEventsTrackingService).toConstantValue(eventsTrackingService);

    const authService = new GoogleAuthService(appConfig.services.googleClientId);
    const currentUserService = new CurrentUserService();
    const loginService = new LoginService(authService, currentUserService, eventsTrackingService);

    currentUserService.loginStatusObservable.subscribe(loginStatus => {
      if (loginStatus.isLoggedIn) {
        eventsTrackingService.sendEvent(EventAction.userLogin, loginStatus.userInfo.attributes.email);
      }
    });

    container.bind(ICurrentUserService).toConstantValue(currentUserService);
    container.bind(ILoginService).toConstantValue(loginService);
    try {
      await loginService.tryLoginUserAutomatically();
    } catch (ex) {
      const err = await normalizeError(ex);
      console.error("Error while loggin in", err);
    }

    const userSettingsService = new UserSettingsBrowserLocalStorageService(currentUserService);
    container.bind(IUserSettingsService).toConstantValue(userSettingsService);
    const userSettings = await userSettingsService.get();

    container.bind(ILocalTempCodeStorage).to(LocalTempCodeStorage);

    const localizedContentLoader = new LocalizedContentLoader(container.get(IAjaxService), userSettings.localeId);
    container.bind(ILocalizedContentLoader).toConstantValue(localizedContentLoader);

    const localizationData = await localizedContentLoader.getFileContent("messages.po");
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

    switch (currentUserService.getLoginStatus().userInfo.attributes.authProvider) {
      case AuthProvider.none:
        container.bind(IUserLibraryRepository).to(ProgramsLocalStorageRepository);
        break;
      case AuthProvider.google:
        container.bind(IUserLibraryRepository).to(ProgramsGoogleDriveRepository);
        break;
    }

    container.bind(IGallerySamplesRepository).to(GallerySamplesRepository);
    container.bind(ITutorialsSamplesRepository).to(TutorialsCodeRepository);
    container.bind(ProgramManagementService).to(ProgramManagementService);
    container.bind(GistSharedProgramsRepository).to(GistSharedProgramsRepository);
  }

  static async reset() {
    container.unload();
    container.unbindAll();
    await this.setup();
  }
}

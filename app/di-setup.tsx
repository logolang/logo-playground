import { Subject } from "rxjs/Subject";

import { container } from "app/di";
import { normalizeError } from "app/utils/error-helpers";

import { AjaxService } from "app/services/infrastructure/ajax-service";
import { AppConfigLoader } from "app/services/config/app-config-loader";
import { CurrentUserService } from "app/services/login/current-user.service";
import { LocalizedContentLoader } from "app/services/infrastructure/localized-content-loader";
import { TutorialsContentService } from "app/services/tutorials/tutorials-content-service";
import { PersonalGalleryLocalRepository } from "app/services/gallery/personal-gallery-local.repository";
import { LocalTempCodeStorage } from "app/services/program/local-temp-code.storage";
import {
  UserSettingsBrowserLocalStorageService,
  IUserSettingsService
} from "app/services/customizations/user-settings.service";
import { NotificationService } from "app/services/infrastructure/notification.service";
import { TitleService } from "app/services/infrastructure/title.service";
import { LocalizationService } from "app/services/customizations/localization.service";
import { NavigationService } from "app/services/infrastructure/navigation.service";
import { ImageUploadImgurService, ImageUploadService } from "app/services/infrastructure/image-upload-imgur.service";
import { AppInfo } from "app/services/infrastructure/app-info";
import { AppConfig } from "app/services/config/app-config";
import { ThemesService } from "app/services/customizations/themes.service";
import { TurtlesService } from "app/services/customizations/turtles.service";
import { GallerySamplesRepository } from "app/services/gallery/gallery-samples.repository";
import { GoogleAuthService } from "app/services/login/google-auth.service";
import { LoginService } from "app/services/login/login.service";
import { ProgramManagementService } from "app/services/program/program-management.service";
import { GistSharedProgramsRepository } from "app/services/program/gist-shared-programs.repository";
import { AuthProvider } from "app/services/login/user-info";
import { PersonalGalleryGoogleDriveRepository } from "app/services/gallery/personal-gallery-googledrive.repository";
import { EventsTrackingService, EventAction } from "app/services/infrastructure/events-tracking.service";
import { GoogleAnalyticsTrackerService } from "app/services/infrastructure/google-analytics-tracker.service";
import { PersonalGalleryService } from "app/services/gallery/personal-gallery.service";
import { PersonalGalleryRemoteRepository } from "app/services/gallery/personal-gallery-remote.repository";
import { updateStringsObject } from "app/i18n/i18n-tools";
import { $T } from "app/i18n/strings";
import { ErrorService } from "app/services/infrastructure/error.service";

/**
 * Declaration for app info object injected by webpack
 */
declare const APP_WEBPACK_STATIC_INFO: AppInfo;

export class DependecyInjectionSetupService {
  public onResetEvents = new Subject<void>();

  public async setup() {
    console.log("start setting up bindings");
    container.bind(DependecyInjectionSetupService).toConstantValue(this);

    container.bind(AjaxService).to(AjaxService);
    container.bind(AppInfo).toConstantValue(APP_WEBPACK_STATIC_INFO);

    const appConfigLoader = new AppConfigLoader(container.get(AjaxService));
    const appConfig = await appConfigLoader.loadData();
    container.bind(AppConfig).toConstantValue(appConfig);

    const eventsTrackingService = new EventsTrackingService();
    const googleTracking = new GoogleAnalyticsTrackerService();
    eventsTrackingService.subscribe(event => {
      googleTracking.trackEvent(event);
    });
    container.bind(EventsTrackingService).toConstantValue(eventsTrackingService);

    const authService = new GoogleAuthService(appConfig.services.googleClientId);
    const currentUserService = new CurrentUserService();
    const loginService = new LoginService(authService, currentUserService, eventsTrackingService);

    currentUserService.loginStatusObservable.subscribe(loginStatus => {
      if (loginStatus.isLoggedIn) {
        eventsTrackingService.sendEvent(EventAction.userLogin, loginStatus.userInfo.attributes.email);
      }
    });

    container.bind(CurrentUserService).toConstantValue(currentUserService);
    container.bind(LoginService).toConstantValue(loginService);
    try {
      await loginService.tryLoginUserAutomatically();
    } catch (ex) {
      const err = await normalizeError(ex);
      console.error("Error while loggin in", err);
    }

    const userSettingsService = new UserSettingsBrowserLocalStorageService(currentUserService);
    container.bind(IUserSettingsService).toConstantValue(userSettingsService);
    const userSettings = await userSettingsService.get();

    container.bind(LocalTempCodeStorage).to(LocalTempCodeStorage);

    const localizedContentLoader = new LocalizedContentLoader(container.get(AjaxService), userSettings.localeId);
    container.bind(LocalizedContentLoader).toConstantValue(localizedContentLoader);

    const poFile = await localizedContentLoader.getFileContent("strings.po");
    updateStringsObject($T, poFile);
    const localizationService = new LocalizationService();
    container.bind(LocalizationService).toConstantValue(localizationService);

    container.bind(NotificationService).to(NotificationService);
    container.bind(NavigationService).to(NavigationService);

    const titleService = new TitleService($T.common.appTitle);
    container.bind(TitleService).toConstantValue(titleService);

    container.bind(TutorialsContentService).to(TutorialsContentService);

    const imageUploadService = new ImageUploadImgurService(
      appConfig.services.imgurServiceClientID,
      appConfig.services.imgurServiceUrl
    );
    container.bind(ImageUploadService).toConstantValue(imageUploadService);

    const themeService = new ThemesService();
    themeService.setActiveTheme(userSettings.themeName);
    container.bind(ThemesService).toConstantValue(themeService);
    container.bind(TurtlesService).to(TurtlesService);

    switch (currentUserService.getLoginStatus().userInfo.attributes.authProvider) {
      case AuthProvider.none:
        container.bind(PersonalGalleryRemoteRepository).toConstantValue(null as any);
        break;
      case AuthProvider.google:
        container.bind(PersonalGalleryRemoteRepository).to(PersonalGalleryGoogleDriveRepository);
        break;
    }

    container.bind(PersonalGalleryLocalRepository).to(PersonalGalleryLocalRepository);
    container.bind(PersonalGalleryService).to(PersonalGalleryService);
    container.bind(GallerySamplesRepository).to(GallerySamplesRepository);
    container.bind(ProgramManagementService).to(ProgramManagementService);
    container.bind(GistSharedProgramsRepository).to(GistSharedProgramsRepository);

    container.bind(ErrorService).to(ErrorService);

    console.log("finish setting up bindings");
  }

  public async reset() {
    container.unbindAll();
    await this.setup();
    this.onResetEvents.next();
  }
}

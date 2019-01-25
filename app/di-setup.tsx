import { container, resolveInject } from "app/di";
import { NULL } from "app/utils/syntax";
import { AuthProvider, UserData } from "./store/env/state.env";
import { AjaxService } from "./services/infrastructure/ajax-service";
import { AppInfo } from "./services/env/app-info";
import { AppConfigLoader } from "./services/env/app-config-loader";
import { AppConfig } from "./services/env/app-config";
import { EventsTrackingService } from "./services/env/events-tracking.service";
import { GoogleAnalyticsTracker } from "./services/infrastructure/google-analytics-tracker";
import { UserSettingsService } from "./services/env/user-settings.service";
import { LocalTempCodeStorage } from "./services/program/local-temp-code.storage";
import { LocalizedContentLoader } from "./services/infrastructure/localized-content-loader";
import { updateStringsObject } from "./utils/i18n";
import { $T } from "./i18n-strings";
import { LocalizationService } from "./services/env/localization.service";
import { NotificationService } from "./services/env/notification.service";
import { NavigationService } from "./services/env/navigation.service";
import { TutorialsContentService } from "./services/tutorials/tutorials-content-service";
import {
  ImageUploadImgurService,
  ImageUploadService
} from "./services/infrastructure/image-upload-imgur.service";
import { ThemesService } from "./services/env/themes.service";
import { TurtlesService } from "./services/env/turtles.service";
import { PersonalGalleryRemoteRepository } from "./services/gallery/personal-gallery-remote.repository";
import { PersonalGalleryGoogleDriveRepository } from "./services/gallery/personal-gallery-googledrive.repository";
import { PersonalGalleryLocalRepository } from "./services/gallery/personal-gallery-local.repository";
import { PersonalGalleryService } from "./services/gallery/personal-gallery.service";
import { GallerySamplesRepository } from "./services/gallery/gallery-samples.repository";
import { ProgramService } from "./services/program/program.service";
import { GistSharedProgramsRepository } from "./services/program/gist-shared-programs.repository";
import { ErrorService } from "./services/env/error.service";
import { LogoCodeSamplesService } from "./services/program/logo-code-samples.service";

/**
 * Declaration for app info object injected by webpack
 */
declare const APP_WEBPACK_STATIC_INFO: AppInfo;

export class DISetup {
  public static async setupConfig() {
    const ajaxService = new AjaxService();
    container.bind(AjaxService).toConstantValue(ajaxService);
    container.bind(AppInfo).toConstantValue(APP_WEBPACK_STATIC_INFO);

    const appConfigLoader = new AppConfigLoader(ajaxService);
    const appConfig = await appConfigLoader.loadData();
    container.bind(AppConfig).toConstantValue(appConfig);
  }

  public static async setup(options: { user: UserData }) {
    console.log("start setting up bindings");
    const ajaxService = resolveInject(AjaxService);
    const appConfig = resolveInject(AppConfig);
    const eventsTrackingService = new EventsTrackingService();
    const googleTracking = new GoogleAnalyticsTracker();
    eventsTrackingService.addTracker(googleTracking.trackEvent);
    container.bind(EventsTrackingService).toConstantValue(eventsTrackingService);

    const userSettingsService = new UserSettingsService(options.user.email);
    container.bind(UserSettingsService).toConstantValue(userSettingsService);
    const userSettings = await userSettingsService.get();

    const localizedContentLoader = new LocalizedContentLoader(
      container.get(AjaxService),
      userSettings.localeId
    );
    container.bind(LocalizedContentLoader).toConstantValue(localizedContentLoader);

    const poFile = await localizedContentLoader.getFileContent("strings.po");
    updateStringsObject($T, poFile);
    const localizationService = new LocalizationService();
    container.bind(LocalizationService).toConstantValue(localizationService);

    container.bind(NotificationService).toConstantValue(new NotificationService());
    container.bind(NavigationService).toConstantValue(new NavigationService());

    container
      .bind(TutorialsContentService)
      .toConstantValue(new TutorialsContentService(localizedContentLoader));

    const imageUploadService = new ImageUploadImgurService(
      appConfig.services.imgurServiceClientID,
      appConfig.services.imgurServiceUrl
    );
    container.bind(ImageUploadService).toConstantValue(imageUploadService);

    const themeService = new ThemesService();
    themeService.setActiveTheme(userSettings.themeName);
    container.bind(ThemesService).toConstantValue(themeService);
    container.bind(TurtlesService).toConstantValue(new TurtlesService());

    let remoteRepo: PersonalGalleryRemoteRepository | null = NULL;
    switch (options.user.authProvider) {
      case AuthProvider.google:
        remoteRepo = new PersonalGalleryGoogleDriveRepository(
          options.user.name,
          options.user.imageUrl,
          appConfig
        );
        break;
    }
    container.bind(PersonalGalleryRemoteRepository).toConstantValue(remoteRepo as any);

    const localRepo = new PersonalGalleryLocalRepository(options.user.email);
    container.bind(PersonalGalleryLocalRepository).toConstantValue(localRepo);

    const galleryService = new PersonalGalleryService(localRepo, remoteRepo);
    container.bind(PersonalGalleryService).toConstantValue(galleryService);

    const samplesRepo = new GallerySamplesRepository(ajaxService);
    container.bind(GallerySamplesRepository).toConstantValue(samplesRepo);

    const gistRepo = new GistSharedProgramsRepository();
    container.bind(GistSharedProgramsRepository).toConstantValue(gistRepo);

    const localCodeStorage = new LocalTempCodeStorage(options.user.email);
    container.bind(LocalTempCodeStorage).toConstantValue(localCodeStorage);

    container
      .bind(ProgramService)
      .toConstantValue(new ProgramService(samplesRepo, galleryService, localCodeStorage, gistRepo));

    container.bind(ErrorService).toConstantValue(new ErrorService());
    container.bind(LogoCodeSamplesService).toConstantValue(new LogoCodeSamplesService());

    console.log("finish setting up bindings");
  }
}

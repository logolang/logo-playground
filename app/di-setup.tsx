import { register, resetBindings, resolve } from "app/di";
import { AjaxService } from "./services/infrastructure/ajax-service";
import { AppConfig, loadConfig } from "./services/env/app-config";
import { EventsTrackingService } from "./services/env/events-tracking.service";
import { GoogleAnalyticsTracker } from "./services/infrastructure/google-analytics-tracker";
import { UserSettingsService } from "./services/env/user-settings.service";
import { LocalTempCodeStorage } from "./services/program/local-temp-code.storage";
import { LocalizedContentLoader } from "./services/infrastructure/localized-content-loader";
import { updateStringsObject } from "./utils/i18n";
import { $T } from "./i18n-strings";
import { TutorialsContentService } from "./services/tutorials/tutorials-content-service";
import {
  ImageUploadImgurService,
  ImageUploadService
} from "./services/infrastructure/image-upload-imgur.service";
import { PersonalGalleryRemoteRepository } from "./services/gallery/personal-gallery-remote.repository";
import { PersonalGalleryGoogleDriveRepository } from "./services/gallery/personal-gallery-googledrive.repository";
import { PersonalGalleryLocalRepository } from "./services/gallery/personal-gallery-local.repository";
import { PersonalGalleryService } from "./services/gallery/personal-gallery.service";
import { GallerySamplesRepository } from "./services/gallery/gallery-samples.repository";
import { ProgramService } from "./services/program/program.service";
import { GistSharedProgramsRepository } from "./services/program/gist-shared-programs.repository";
import { LogoCodeSamplesService } from "./services/program/logo-code-samples.service";
import { AuthService, UserData, AuthProvider } from "./services/env/auth-service";
import { PersonalGalleryImportService } from "./services/gallery/personal-gallery-import.service";

export class DISetup {
  public static async setupConfig() {
    const appConfig = await loadConfig();
    register(AppConfig, appConfig);

    const authService = new AuthService(appConfig);
    register(AuthService, authService);
  }

  public static async setup(options: { user: UserData }) {
    const appConfig = resolve(AppConfig);
    const ajaxService = new AjaxService();

    const eventsTrackingService = new EventsTrackingService();
    const googleTracking = new GoogleAnalyticsTracker();
    eventsTrackingService.addTracker(googleTracking.trackEvent);
    register(EventsTrackingService, eventsTrackingService);

    const userSettingsService = new UserSettingsService(options.user.email);
    register(UserSettingsService, userSettingsService);
    const userSettings = await userSettingsService.get();

    const localizedContentLoader = new LocalizedContentLoader(ajaxService, userSettings.localeId);
    register(LocalizedContentLoader, localizedContentLoader);

    const poFile = await localizedContentLoader.getFileContent("strings.po");
    updateStringsObject($T, poFile);

    register(TutorialsContentService, new TutorialsContentService(localizedContentLoader));

    const imageUploadService = new ImageUploadImgurService(
      appConfig.services.imgurServiceClientID,
      appConfig.services.imgurServiceUrl
    );
    register(ImageUploadService, imageUploadService);

    const samplesRepo = new GallerySamplesRepository(ajaxService);
    register(GallerySamplesRepository, samplesRepo);

    const localRepo = new PersonalGalleryLocalRepository(options.user.email);
    let remoteRepo: PersonalGalleryRemoteRepository | undefined = undefined;
    switch (options.user.authProvider) {
      case AuthProvider.google:
        remoteRepo = new PersonalGalleryGoogleDriveRepository(
          options.user.name,
          options.user.imageUrl,
          appConfig
        );
        break;
    }

    const galleryService = new PersonalGalleryService(localRepo, remoteRepo);
    register(PersonalGalleryService, galleryService);

    const gistRepo = new GistSharedProgramsRepository();
    register(GistSharedProgramsRepository, gistRepo);

    const localCodeStorage = new LocalTempCodeStorage(options.user.email);
    register(LocalTempCodeStorage, localCodeStorage);

    register(
      ProgramService,
      new ProgramService(samplesRepo, galleryService, localCodeStorage, gistRepo)
    );

    register(LogoCodeSamplesService, new LogoCodeSamplesService());

    register(PersonalGalleryImportService, new PersonalGalleryImportService(galleryService));
  }

  public static reset() {
    resetBindings();
  }
}

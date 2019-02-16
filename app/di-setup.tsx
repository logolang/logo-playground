import { register, resetBindings } from "app/di";
import { AppConfig } from "./services/env/app-config";
import { EventsTrackingService } from "./services/env/events-tracking.service";
import { GoogleAnalyticsTracker } from "./services/infrastructure/google-analytics-tracker";
import { UserSettingsService } from "./services/env/user-settings.service";
import { LocalPlaygroundCodeStorage } from "./services/program/local-playground-code.storage";
import { LocalizedContentLoader } from "./services/infrastructure/localized-content-loader";
import { updateStringsObject } from "./utils/i18n/i18n";
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
import { SharedProgramsRepository } from "./services/program/shared-programs.repository";
import { LogoCodeSamplesService } from "./services/program/logo-code-samples.service";
import { UserData, AuthProvider, AuthService } from "./services/env/auth-service";
import { PersonalGalleryImportService } from "./services/gallery/personal-gallery-import.service";

export class DISetup {
  public static async setup(options: { appConfig: AppConfig }) {
    resetBindings();

    const { appConfig } = options;

    const authService = new AuthService(appConfig);
    register(AuthService, authService);
    const user = await authService.init();

    const eventsTrackingService = new EventsTrackingService();
    const googleTracking = new GoogleAnalyticsTracker();
    eventsTrackingService.addTracker(googleTracking.trackEvent);
    register(EventsTrackingService, eventsTrackingService);

    const userSettingsService = new UserSettingsService(user.email);
    register(UserSettingsService, userSettingsService);
    const userSettings = await userSettingsService.get();

    const localizedContentLoader = new LocalizedContentLoader(userSettings.localeId);
    register(LocalizedContentLoader, localizedContentLoader);

    const poFile = await localizedContentLoader.getFileContent("strings.po");
    updateStringsObject($T, poFile);

    register(TutorialsContentService, new TutorialsContentService(localizedContentLoader));

    const imageUploadService = new ImageUploadImgurService(
      appConfig.services.imgurServiceClientID,
      appConfig.services.imgurServiceUrl
    );
    register(ImageUploadService, imageUploadService);

    const samplesRepo = new GallerySamplesRepository();
    register(GallerySamplesRepository, samplesRepo);

    const localRepo = new PersonalGalleryLocalRepository(user.email);
    let remoteRepo: PersonalGalleryRemoteRepository | undefined;
    switch (user.authProvider) {
      case AuthProvider.google:
        remoteRepo = new PersonalGalleryGoogleDriveRepository(user.name, user.imageUrl, appConfig);
        break;
    }

    const galleryService = new PersonalGalleryService(localRepo, remoteRepo);
    register(PersonalGalleryService, galleryService);

    const sharedProgramsRepo = new SharedProgramsRepository();
    register(SharedProgramsRepository, sharedProgramsRepo);

    const localCodeStorage = new LocalPlaygroundCodeStorage(user.email);
    register(LocalPlaygroundCodeStorage, localCodeStorage);

    register(
      ProgramService,
      new ProgramService(samplesRepo, galleryService, localCodeStorage, sharedProgramsRepo)
    );

    register(LogoCodeSamplesService, new LogoCodeSamplesService());

    register(PersonalGalleryImportService, new PersonalGalleryImportService(galleryService));

    return {
      user,
      userSettings
    };
  }
}

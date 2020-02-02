import { register, resetBindings } from "utils/di";
import { updateStringsObject } from "utils/i18n/i18n";
import { $T } from "i18n-strings";
import { AppConfig } from "services/app-config";
import { EventsTrackingService } from "services/infrastructure/events-tracking.service";
import { GoogleAnalyticsTracker } from "services/infrastructure/google-analytics-tracker";
import { UserSettingsService } from "services/user-settings.service";
import { LocalPlaygroundCodeStorage } from "services/local-playground-code.storage";
import { LocalizedContentLoader } from "services/localized-content-loader";
import { TutorialsService } from "services/tutorials-service";
import {
  ImageUploadImgurService,
  ImageUploadService
} from "services/infrastructure/image-upload-imgur.service";
import { GalleryRemoteRepository } from "services/gallery-remote.repository";
import { GalleryGoogleDriveRepository } from "services/gallery-googledrive.repository";
import { GalleryLocalRepository } from "services/gallery-local.repository";
import { GalleryService } from "services/gallery.service";
import { GallerySamplesRepository } from "services/gallery-samples.repository";
import { ProgramService } from "services/program.service";
import { SharedProgramsRepository } from "services/programs-shared.repository";
import { LogoCodeSamplesService } from "services/logo-code-samples.service";
import { AuthProvider, AuthService } from "services/infrastructure/auth-service";
import { GalleryImportService } from "services/gallery-import.service";
import { LogoImportsResolverService } from "services/logo-imports-resolver.service";
import { themesManager } from "ui/themes-helper";

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

    themesManager.setTheme(themesManager.getThemeByName(userSettings.themeName));

    const localizedContentLoader = new LocalizedContentLoader(userSettings.localeId);
    register(LocalizedContentLoader, localizedContentLoader);

    const poFile = await localizedContentLoader.loadFile("content/strings.po", { useLocale: true });
    updateStringsObject($T, poFile);

    register(TutorialsService, new TutorialsService(localizedContentLoader));

    const imageUploadService = new ImageUploadImgurService(
      appConfig.services.imgurServiceClientID,
      appConfig.services.imgurServiceUrl
    );
    register(ImageUploadService, imageUploadService);

    const samplesRepo = new GallerySamplesRepository();
    register(GallerySamplesRepository, samplesRepo);

    const localRepo = new GalleryLocalRepository(user.email);
    let remoteRepo: GalleryRemoteRepository | undefined;
    switch (user.authProvider) {
      case AuthProvider.google:
        remoteRepo = new GalleryGoogleDriveRepository(user.name, user.imageUrl, appConfig);
        break;
    }

    const galleryService = new GalleryService(localRepo, remoteRepo);
    register(GalleryService, galleryService);

    const sharedProgramsRepo = new SharedProgramsRepository();
    register(SharedProgramsRepository, sharedProgramsRepo);

    const localCodeStorage = new LocalPlaygroundCodeStorage(user.email);
    register(LocalPlaygroundCodeStorage, localCodeStorage);

    register(
      ProgramService,
      new ProgramService(samplesRepo, galleryService, localCodeStorage, sharedProgramsRepo)
    );

    register(LogoCodeSamplesService, new LogoCodeSamplesService());

    register(GalleryImportService, new GalleryImportService(galleryService));

    register(LogoImportsResolverService, new LogoImportsResolverService(localRepo, samplesRepo));

    return {
      user,
      userSettings
    };
  }
}

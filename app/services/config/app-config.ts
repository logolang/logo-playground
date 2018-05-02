import { injectable } from "app/di";

@injectable()
export abstract class AppConfig {
  services: {
    appApiUrl: string;
    imgurServiceUrl: string;
    imgurServiceClientID: string;
    googleClientId: string;
    googleDriveGalleryFilename: string;
  };
}

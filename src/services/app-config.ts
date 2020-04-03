export class AppConfig {
  services: {
    appApiUrl: string;
    imgurServiceUrl: string;
    imgurServiceClientID: string;
    googleClientId: string;
    googleDriveGalleryFilename: string;
  };
}

declare const APP_CONFIG: AppConfig;

export function getConfig(): AppConfig {
  return APP_CONFIG;
}

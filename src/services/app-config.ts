export class AppConfig {
  services: {
    appApiUrl: string;
    imgurServiceUrl: string;
    imgurServiceClientID: string;
    googleClientId: string;
    googleDriveGalleryFilename: string;
  };
}

export async function loadConfig(): Promise<AppConfig> {
  const headers = new Headers();
  headers.append("pragma", "no-cache");
  headers.append("cache-control", "no-cache");

  const result = await fetch("content/config/config.json", {
    credentials: "same-origin",
    method: "get",
    headers: headers
  });

  if (result.ok) {
    return result.json();
  }
  throw result;
}

export interface ILocaleInfo {
  name: string;
  id: string;
}

const supportedLocales: ILocaleInfo[] = [
  {
    name: "English",
    id: "en"
  },
  {
    name: "Русский",
    id: "ru"
  }
];

export class LocalizationService {
  getSupportedLocales(): ILocaleInfo[] {
    return supportedLocales;
  }

  getLocaleById(id: string): ILocaleInfo {
    const matched = supportedLocales.find(l => l.id === id);
    return matched || supportedLocales[0];
  }
}

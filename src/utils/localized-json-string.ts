export type LocalizedJsonString =
  | string
  | {
      [localeId: string]: string;
    };

function getErr(localizedString: object) {
  return new Error("Error with parsing localized string: " + JSON.stringify(localizedString));
}

export function setLocalizedString(localizedString: LocalizedJsonString, localeId: string) {
  if (typeof localizedString === "string") {
    return localizedString;
  }
  if (typeof localizedString === "object") {
    const value = localizedString[localeId] || localizedString["en"];
    if (!value) {
      throw getErr(localizedString);
    }
  }
  throw getErr(localizedString);
}

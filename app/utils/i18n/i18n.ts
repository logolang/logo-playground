/// <reference types="./types" />
import * as Jed from "jed";
import * as po2json from "po2json/lib/parse";

let i18n: any; // Jed onject

export class Plural {
  _forms: string[];
  _messageKey: string;

  constructor(oneForm: string, multipleForm: string) {
    this._forms = [oneForm, multipleForm];
  }

  public val(count: number): string {
    if (i18n) {
      return i18n
        .translate(this._messageKey)
        .ifPlural(count, "")
        .fetch(count);
    }
    throw new Error("Locale data is not initialized yet");
  }
}

export class Template {
  _template: string;
  _messageKey: string;

  constructor(template: string, private numberOfParameters: number) {
    this._template = template;
  }

  public val(...values: string[]) {
    if (values.length != this.numberOfParameters) {
      throw new Error("Number of parameters to template string is wrong!");
    }
    if (i18n) {
      return i18n.translate(this._messageKey).fetch(...values);
    }
    throw new Error("Locale data is not initialized yet");
  }
}

export function updateStringsObject(targetObject: any, poFileContent: string): any {
  const localeData = po2json(poFileContent, { format: "jed1.x" });
  i18n = new Jed(localeData);

  // scan the $T object and update records
  function scanLevel(level: any, parentName: string) {
    for (const [key, val] of Object.entries(level)) {
      const entryName = parentName ? parentName + "." + key : key;
      if (typeof val === "string") {
        level[key] = i18n.translate(entryName).fetch();
      } else if (val instanceof Plural) {
        val._messageKey = entryName;
      } else if (val instanceof Template) {
        val._messageKey = entryName;
      } else if (typeof val === "object") {
        scanLevel(val, entryName);
      }
    }
  }
  scanLevel(targetObject, "");
}

import { RandomHelper } from "./random-helper";

const jsonStringifiedDate = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/;

export const defaultDate = new Date(0);

export function formatFileSize(size: number): string {
  if (size == 0) {
    return "Empty file";
  }
  const i: number = Math.floor(Math.log(size) / Math.log(1024));
  const y = size / Math.pow(1024, i);
  const f = y.toFixed(2);
  return f + " " + ["B", "kB", "MB", "GB", "TB"][i];
}

export function formatId(name: string, checkIfIdIsBusy: (id: string) => boolean): string {
  let id = name.toLowerCase().replace(/\W/g, "-");
  if (id == "") {
    id = RandomHelper.getRandomObjectId(4);
  }
  let indexedId = id;
  let index = 1;
  while (checkIfIdIsBusy(indexedId)) {
    index++;
    indexedId = id + "-" + index;
  }
  return indexedId;
}

/**
 * Returns file extension in lowercase without dot
 * If extension is not there return empty string
 */
export function getFileExtension(fileName: string): string {
  if (!fileName) {
    return "";
  }
  const dotIndex = fileName.lastIndexOf(".");
  if (dotIndex < 0) {
    return "";
  }
  return fileName.substr(dotIndex + 1).toLowerCase();
}

/**
 * Convert date object to string using JSON format like 
 */
export function stringifyDateAsJson(dateValue: Date): string {
  return JSON.parse(JSON.stringify({ d: dateValue })).d;
}

/**
 * Use to convert Date serialized in JSON objects as a second argument to JSON.parse
 * Example:
 * ```
 * JSON.parse(json, jsonDateReviver); 
 * ```
 */
export function jsonDateReviver(key: string, value: any) {
  // first, just make sure the property is a string:
  if (typeof value === "string") {
    // then, use regex to see if it's an ISO-formatted string
    const a = jsonStringifiedDate.exec(value);
    if (a) {
      // if so, Date() can parse it:
      return new Date(value);
    }
  }
  // important: you need to return any values you're not parsing, or they die...
  return value;
}

export function parseDateFromJson(dateStr: string, defaultValue?: Date): Date {
  if (dateStr && jsonStringifiedDate.exec(dateStr)) {
    // if so, Date() can parse it:
    return new Date(dateStr);
  } else {
    if (defaultValue) {
      return defaultValue;
    }
    throw new Error("Cannot parse a date from " + dateStr);
  }
}

/**
 * Convert string to Base16 representation. May be used to convert binary strings as well
 */
export function strToBase16(bin: string): string {
  const hex: string[] = [];
  for (let i = 0; i < bin.length; ++i) {
    let tmp = bin.charCodeAt(i).toString(16);
    if (tmp.length === 1) {
      tmp = "0" + tmp;
    }
    hex[hex.length] = tmp;
  }
  return hex.join("");
}

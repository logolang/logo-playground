export class LocalStorage<T> {
  constructor(private storageKey: string, private defaultValue: T) {}

  getValue(): T {
    // Check for window in case we are running this from unit tests
    if (typeof window === "undefined") {
      return this.defaultValue;
    }
    const val = window.localStorage.getItem(this.storageKey);
    if (val && val != "") {
      return JSON.parse(val);
    }
    return this.defaultValue;
  }

  setValue(value: T | undefined) {
    // Check for window in case we are running this from unit tests
    if (typeof window === "undefined") {
      return;
    }
    if (value === undefined) {
      window.localStorage.removeItem(this.storageKey);
    } else {
      window.localStorage.setItem(this.storageKey, JSON.stringify(value));
    }
  }
}

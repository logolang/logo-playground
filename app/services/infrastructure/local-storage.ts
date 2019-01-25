export class LocalStorage<T> {
  constructor(private storageKey: string, private defaultValue: T) {}

  getValue(): T {
    const val = window.localStorage.getItem(this.storageKey);
    if (val && val != "") {
      return JSON.parse(val);
    }
    return this.defaultValue;
  }

  setValue(value: T | undefined) {
    if (value === undefined) {
      window.localStorage.removeItem(this.storageKey);
    } else {
      window.localStorage.setItem(this.storageKey, JSON.stringify(value));
    }
  }
}

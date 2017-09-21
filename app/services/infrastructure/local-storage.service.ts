export class LocalStorageService<T> {
  constructor(private storageKey: string, private defaultValue: T) {}

  getValue(): T {
    const val = window.localStorage.getItem(this.storageKey);
    if (val && val != "") {
      return JSON.parse(val);
    }
    return this.defaultValue;
  }

  setValue(value: T) {
    window.localStorage.setItem(this.storageKey, JSON.stringify(value));
  }

  clearValue() {
    window.localStorage.removeItem(this.storageKey);
  }
}

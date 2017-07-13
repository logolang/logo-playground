/**
 * Checks that argument is not null or undefined and returns the argument back
 */
export function ensure<S>(value: S | undefined): S {
  if (value !== null && value !== undefined) {
    return value;
  }
  // Throw catch and rethrow - log error to console with stacktrace.
  try {
    throw new Error("Validation failed: value must not be null");
  } catch (ex) {
    console.error(ex);
    throw ex;
  }
}

export class Lazy<T> {
  private _value: T | undefined;

  constructor(private factoryAction: () => T) {}

  get value(): T {
    if (this._value) {
      return this._value;
    }
    this._value = this.factoryAction();
    ensure(this._value);
    return this._value;
  }
}

export type DictionaryLike<V> = { [name: string]: V };

export function as<T>(object: T): T {
  return object;
}

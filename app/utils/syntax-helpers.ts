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

export interface SortingOptions<T> {
  direction?: "desc" | "asc";
  sortBy(item: T): string | number | boolean | Date | undefined;
}

/**
 * Sorting method allowing to compare objects by a number of properties, uses case-insensitive
 * comparison for strings
 * @param criterions
 */
export function createCompareFunction<T>(criterions: SortingOptions<T>[]) {
  const s = function(itemA: T, itemB: T) {
    for (const options of criterions) {
      let valA = options.sortBy(itemA);
      valA = valA === undefined || valA === null ? "" : valA;
      valA = typeof valA == "string" ? valA.toLowerCase() : valA;
      if (typeof valA == "object" && typeof valA.getTime == "function") {
        valA = valA.getTime();
      }

      let valB = options.sortBy(itemB);
      valB = valB === undefined || valB === null ? "" : valB;
      valB = typeof valB == "string" ? valB.toLowerCase() : valB;
      if (typeof valB == "object" && typeof valB.getTime == "function") {
        valB = valB.getTime();
      }

      if (valA != valB) {
        if (options.direction == "desc") {
          return valB < valA ? -1 : 1;
        } else {
          return valB < valA ? 1 : -1;
        }
      }
    }
    return 0;
  };

  return function(itemA: T, itemB: T) {
    const v = s(itemA, itemB);
    console.log("S", itemA, itemB, v);
    return v;
  };
}

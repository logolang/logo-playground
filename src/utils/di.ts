import { DictionaryLike } from "./syntax";

interface Abstract<T> {
  prototype: T;
  name: string;
}

let bindings: DictionaryLike<any> = {};

export function resetBindings() {
  bindings = {};
}

export function register<T>(serviceIdentifier: Abstract<T>, instance: T): void {
  const name = serviceIdentifier.name;
  bindings[name] = instance;
}

export function resolve<T>(serviceIdentifier: Abstract<T>): T {
  const name = serviceIdentifier.name;
  const instance = bindings[name];
  if (!instance) {
    throw new Error("Missed registration for " + name);
  }
  return instance;
}

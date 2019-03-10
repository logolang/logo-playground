import { DictionaryLike } from "./syntax";

export interface Abstract<T> {
  prototype: T;
  name: string;
}

let bindings: DictionaryLike<any> = {};

export function resetBindings() {
  bindings = {};
}

export function register<T>(serviceIdentifier: Abstract<T>, instance: T): void {
  const name = serviceIdentifier.name;
  console.log("registering " + name);
  bindings[name] = instance;
}

export function registerMockService<T>(serviceIdentifier: Abstract<T>, mockInstance: Partial<T>) {
  register(serviceIdentifier, mockInstance);
}

export function resolve<T>(serviceIdentifier: Abstract<T>): T {
  const name = serviceIdentifier.name;
  console.log("resolve " + name);
  const instance = bindings[name];
  if (!instance) {
    throw new Error("Missed registration for " + name);
  }
  return instance;
}

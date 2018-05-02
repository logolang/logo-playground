import { Container, inject, injectable } from "inversify";

const container = new Container({ defaultScope: "Singleton" });
export { container, inject, injectable };

interface Abstract<T> {
  prototype: T;
}

export function resolveInject<T>(serviceIdentifier: Abstract<T>): T {
  const all = container.getAll(serviceIdentifier);
  if (all.length == 0) {
    throw new Error("No binding is configured " + serviceIdentifier);
  }
  if (all.length > 1) {
    console.error("Found multiple bindings!!", serviceIdentifier);
  }
  return all[0];
}

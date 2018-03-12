import { Container, inject, injectable } from "inversify";

const container = new Container({ defaultScope: "Singleton" });
export { container, inject, injectable };

interface Abstract<T> {
  prototype: T;
}

export function resolveInject<T>(serviceIdentifier: Abstract<T>): T {
  return container.get(serviceIdentifier);
}

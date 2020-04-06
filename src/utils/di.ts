export interface Abstract<T> {
  prototype: T;
  name: string;
}

interface Binding {
  key: {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
}

let bindings: Binding[] = [];

export function resetBindings() {
  bindings = [];
}

export function register<T>(serviceIdentifier: Abstract<T>, instance: T): void {
  const recIndex = bindings.findIndex(b => b.key === serviceIdentifier);
  if (recIndex >= 0) {
    bindings[recIndex].value = instance;
  } else {
    bindings.push({ key: serviceIdentifier, value: instance });
  }
}

export function registerMockService<T>(serviceIdentifier: Abstract<T>, mockInstance: Partial<T>) {
  register(serviceIdentifier, mockInstance);
}

export function resolve<T>(serviceIdentifier: Abstract<T>): T {
  const rec = bindings.find(b => b.key === serviceIdentifier);
  if (!rec) {
    throw new Error("Missed registration for service: " + serviceIdentifier.name);
  }
  return rec.value;
}

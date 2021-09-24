import { LitElement } from 'lit';

declare type Constructor<T> = new (...args: any[]) => T; // eslint-disable-line @typescript-eslint/no-explicit-any

declare function PolylitMixin<T extends Constructor<LitElement>>(
  base: T
): T & PolylitMixinConstructor;

interface PolylitMixinConstructor {
  new (...args: any[]): PolylitMixin; // eslint-disable-line @typescript-eslint/no-explicit-any
}

interface PolylitMixin {
  ready: void;
}

export { PolylitMixin, PolylitMixinConstructor };

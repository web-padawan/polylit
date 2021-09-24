import { dedupeMixin } from '@open-wc/dedupe-mixin';

function upper(name) {
  return name[0].toUpperCase() + name.substring(1);
}

const PolylitMixinImplementation = (superclass) => {
  class PolylitMixinClass extends superclass {
    static getPropertyDescriptor(name, key, options) {
      const defaultDescriptor = super.getPropertyDescriptor(name, key, options);

      if (options.readOnly) {
        const setter = defaultDescriptor.set;

        this.addInitializer((instance) => {
          // This is run during construction of the element
          instance['_set' + upper(name)] = function (value) {
            setter.call(instance, value);
          };
        });

        return {
          get: defaultDescriptor.get,
          set() {
            // Do nothing, property is read-only.
          },
          configurable: true,
          enumerable: true
        };
      }

      if (options.observer) {
        const method = options.observer;

        if (!this.__observers) {
          this.__observers = new Map();
          // eslint-disable-next-line no-prototype-builtins
        } else if (!this.hasOwnProperty('__observers')) {
          // clone any existing observers (superclasses)
          const observers = this.__observers;
          this.__observers = new Map();
          observers.forEach((v, k) => this.__observers.set(k, v));
        }

        // set this method
        this.__observers.set(name, method);

        this.addInitializer((instance) => {
          if (!instance[method]) {
            console.warn(`observer method ${method} not defined`);
            return;
          }

          const userUpdated = instance.__proto__.updated;

          instance.updated = function (changedProperties) {
            userUpdated.call(this, changedProperties);

            const observers = instance.constructor.__observers;

            changedProperties.forEach((v, k) => {
              const observer = observers.get(k);
              if (observer !== undefined) {
                instance[observer](instance[k], v);
              }
            });
          };
        });
      }

      return defaultDescriptor;
    }

    /** @protected */
    ready() {
      if (super.ready) {
        super.ready();
      }
    }

    /** @protected */
    firstUpdated() {
      super.firstUpdated();

      this.ready();
    }
  }

  return PolylitMixinClass;
};

export const PolylitMixin = dedupeMixin(PolylitMixinImplementation);

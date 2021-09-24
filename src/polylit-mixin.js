import { dedupeMixin } from '@open-wc/dedupe-mixin';

function upper(name) {
  return name[0].toUpperCase() + name.substring(1);
}

const PolylitMixinImplementation = (superclass) => {
  class PolylitMixinClass extends superclass {
    static getPropertyDescriptor(name, key, options) {
      const defaultDescriptor = super.getPropertyDescriptor(name, key, options);

      let result = defaultDescriptor;

      if (options.readOnly) {
        const setter = defaultDescriptor.set;

        this.addInitializer((instance) => {
          // This is run during construction of the element
          instance['_set' + upper(name)] = function (value) {
            setter.call(instance, value);
          };
        });

        result = {
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

          instance.__patchUpdated();
        });
      }

      return result;
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

    /** @private */
    __patchUpdated() {
      if (this.__updatedPatched) {
        return;
      }

      const proto = Object.getPrototypeOf(this);
      const userUpdated = proto.updated;

      this.updated = function (props) {
        userUpdated.call(this, props);

        this.__runObservers(props, proto.constructor.__observers);
      };
    }

    /** @private */
    __runObservers(props, observers) {
      props.forEach((v, k) => {
        const observer = observers.get(k);
        if (observer !== undefined && this[observer]) {
          this[observer](this[k], v);
        }
      });
    }
  }

  return PolylitMixinClass;
};

export const PolylitMixin = dedupeMixin(PolylitMixinImplementation);

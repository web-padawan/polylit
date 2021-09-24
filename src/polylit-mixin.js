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

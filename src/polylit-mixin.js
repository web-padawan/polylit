import { dedupeMixin } from '@open-wc/dedupe-mixin';

const PolylitMixinImplementation = (superclass) => {
  class PolylitMixinClass extends superclass {
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

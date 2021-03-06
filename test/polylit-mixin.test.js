import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { fixtureSync, defineCE } from '@vaadin/testing-helpers';
import { LitElement, html } from 'lit';
import { PolylitMixin } from '../src/polylit-mixin.js';

describe('PolylitMixin', () => {
  describe('ready', () => {
    let element;
    let readySpy = sinon.spy();

    const tag = defineCE(
      class extends PolylitMixin(LitElement) {
        ready() {
          readySpy();
        }

        render() {
          return html`Ready!`;
        }
      }
    );

    beforeEach(() => {
      element = fixtureSync(`<${tag}></${tag}>`);
    });

    it('should call ready when element update is complete', async () => {
      expect(readySpy.calledOnce).to.be.false;
      await element.updateComplete;
      expect(readySpy.calledOnce).to.be.true;
    });
  });

  describe('reflectToAttribute', () => {
    let element;

    const tag = defineCE(
      class extends PolylitMixin(LitElement) {
        static get properties() {
          return {
            name: {
              type: String,
              reflectToAttribute: true
            },

            disabled: {
              type: Boolean,
              reflectToAttribute: true
            }
          };
        }

        render() {
          return html`<button ?disabled="${this.disabled}">${this.name}</button>`;
        }
      }
    );

    beforeEach(async () => {
      element = fixtureSync(`<${tag}></${tag}>`);
      await element.updateComplete;
    });

    it('should reflect string property to attribute', async () => {
      element.name = 'foo';
      await element.updateComplete;
      expect(element.getAttribute('name')).to.equal('foo');

      element.name = undefined;
      await element.updateComplete;
      expect(element.hasAttribute('name')).to.be.false;
    });

    it('should reflect boolean property to attribute', async () => {
      element.disabled = true;
      await element.updateComplete;
      expect(element.hasAttribute('disabled')).to.be.true;

      element.disabled = false;
      await element.updateComplete;
      expect(element.hasAttribute('disabled')).to.be.false;
    });
  });

  describe('readOnly', () => {
    let element;

    const tag = defineCE(
      class extends PolylitMixin(LitElement) {
        static get properties() {
          return {
            helper: {
              type: String
            },

            value: {
              type: String,
              readOnly: true
            }
          };
        }

        render() {
          return html`${this.value}${this.helper}`;
        }
      }
    );

    beforeEach(async () => {
      element = fixtureSync(`<${tag}></${tag}>`);
      await element.updateComplete;
    });

    it('should not set property marked as readOnly using setter', async () => {
      element.value = 'foo';
      await element.updateComplete;
      expect(element.value).to.not.equal('foo');
      expect(element.shadowRoot.textContent).to.not.equal('foo');
    });

    it('should set property marked as readOnly using private method', async () => {
      element._setValue('foo');
      await element.updateComplete;
      expect(element.value).to.equal('foo');
      expect(element.shadowRoot.textContent).to.equal('foo');
    });

    it('should set property not marked as readOnly using setter', async () => {
      element.helper = 'bar';
      await element.updateComplete;
      expect(element.helper).to.equal('bar');
      expect(element.shadowRoot.textContent).to.equal('bar');
    });
  });

  describe('observer', () => {
    let element;

    describe('default', () => {
      const tag = defineCE(
        class extends PolylitMixin(LitElement) {
          static get properties() {
            return {
              value: {
                type: String,
                observer: '_valueChanged'
              },

              label: {
                type: String,
                observer: '_labelChanged'
              },

              hasLabel: {
                type: Boolean
              },

              text: {
                type: String,
                readOnly: true,
                observer: '_textChanged'
              },

              count: {
                type: Number
              },

              calls: {
                type: Array
              }
            };
          }

          constructor() {
            super();
            this.calls = [];
            this.updateCount = 0;
          }

          render() {
            return html`${this.value}`;
          }

          willUpdate(props) {
            super.willUpdate(props);

            this.updateCount += 1;
          }

          _valueChanged(value, oldValue) {
            this.calls.push([value, oldValue]);
          }

          _labelChanged(value) {
            this.hasLabel = !!value;
          }

          _textChanged(value) {
            if (value) {
              this.count = value.length;
            }
          }
        }
      );

      beforeEach(async () => {
        element = fixtureSync(`<${tag}></${tag}>`);
        await element.updateComplete;
      });

      it('should run single property observer on property change', async () => {
        element.value = 'foo';
        await element.updateComplete;
        expect(element.calls[0]).to.deep.equal(['foo', undefined]);
      });

      it('should pass old and new value to single property observer', async () => {
        element.value = 'foo';
        await element.updateComplete;
        expect(element.calls[0]).to.deep.equal(['foo', undefined]);

        element.value = 'bar';
        await element.updateComplete;
        expect(element.calls[1]).to.deep.equal(['bar', 'foo']);
      });

      it('should run single property observer for read-only property', async () => {
        element._setText('abcde');
        await element.updateComplete;
        expect(element.count).to.equal(5);
      });

      it('should include property set in observer to the same update', async () => {
        element.label = 'foo';
        await element.updateComplete;
        expect(element.hasLabel).to.be.true;
      });

      it('should not affect willUpdate method defined by the user', async () => {
        expect(element.updateCount).to.equal(1);
        element.value = 'foo';
        await element.updateComplete;
        expect(element.updateCount).to.equal(2);
      });
    });

    describe('superclass', () => {
      class AbstractClass extends PolylitMixin(LitElement) {
        static get properties() {
          return {
            value: {
              type: String,
              observer: '_valueChanged'
            },

            calls: {
              type: Array
            }
          };
        }

        constructor() {
          super();
          this.calls = [];
        }

        _valueChanged(value, oldValue) {
          this.calls.push([value, oldValue]);
        }
      }

      const tag = defineCE(
        class extends AbstractClass {
          static get properties() {
            return {
              text: {
                type: String,
                observer: '_textChanged'
              },

              count: {
                type: Number
              }
            };
          }

          constructor() {
            super();
            this.count = 0;
          }

          render() {
            return html`${this.value}`;
          }

          _textChanged(value) {
            if (value) {
              this.count = value.length;
            }
          }
        }
      );

      beforeEach(async () => {
        element = fixtureSync(`<${tag}></${tag}>`);
        await element.updateComplete;
      });

      it('should run both own and inherited single property observers', async () => {
        element.value = 'foo';
        element.text = 'abc';
        await element.updateComplete;
        expect(element.calls[0]).to.deep.equal(['foo', undefined]);
        expect(element.count).to.equal(3);
      });
    });

    describe('missing', () => {
      const tag = defineCE(
        class extends PolylitMixin(LitElement) {
          static get properties() {
            return {
              label: {
                type: String,
                observer: '_labelChanged'
              },

              value: {
                type: String,
                observer: '_valueChanged'
              }
            };
          }

          render() {
            return html`${this.value}`;
          }
        }
      );

      before(() => {
        sinon.stub(console, 'warn');
      });

      after(() => {
        console.warn.restore();
      });

      beforeEach(() => {
        element = fixtureSync(`<${tag}></${tag}>`);
      });

      it('should warn for each missing observer', async () => {
        await element.updateComplete;
        expect(console.warn.calledTwice).to.be.true;
        expect(console.warn.firstCall.args[0]).to.include('label');
        expect(console.warn.secondCall.args[0]).to.include('value');
      });
    });
  });

  describe('notify', () => {
    let element;

    const tag = defineCE(
      class extends PolylitMixin(LitElement) {
        static get properties() {
          return {
            value: {
              type: String,
              observer: '_valueChanged',
              notify: true
            },

            hasValue: {
              type: String,
              notify: true
            },

            loading: {
              type: Boolean,
              readOnly: true,
              notify: true
            }
          };
        }

        render() {
          return html`${this.value}`;
        }

        _valueChanged(value) {
          this.hasValue = !!value;
        }
      }
    );

    beforeEach(async () => {
      element = fixtureSync(`<${tag}></${tag}>`);
      await element.updateComplete;
    });

    it('should fire notification event on property change', async () => {
      const spy = sinon.spy();
      element.addEventListener('value-changed', spy);
      element.value = 'foo';
      await element.updateComplete;
      expect(spy.calledOnce).to.be.true;
    });

    it('should fire notification event for property set in observer', async () => {
      const spy = sinon.spy();
      element.addEventListener('has-value-changed', spy);
      element.value = 'foo';
      await element.updateComplete;
      expect(spy.calledOnce).to.be.true;
    });

    it('should fire notification event for read-only property', async () => {
      const spy = sinon.spy();
      element.addEventListener('loading-changed', spy);
      element._setLoading(true);
      await element.updateComplete;
      expect(spy.calledOnce).to.be.true;
    });
  });
});

import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { fixture, defineCE } from '@open-wc/testing-helpers';
import { LitElement, html } from 'lit';
import { PolylitMixin } from '../src/polylit-mixin.js';

describe('PolylitMixin', () => {
  describe('ready', () => {
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

    beforeEach(async () => {
      await fixture(`<${tag}></${tag}>`);
    });

    it('should call ready when element is created', () => {
      expect(readySpy.calledOnce).to.be.true;
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
      element = await fixture(`<${tag}></${tag}>`);
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
});

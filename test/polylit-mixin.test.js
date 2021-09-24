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
});

import {describe, it, expect} from 'vitest';
import {codemod} from './object-hasown.js';

describe('object-hasown', () => {
  it('should replace obj.hasOwnProperty() with Object.hasOwn()', () => {
    const source = `
      const has = obj.hasOwnProperty('key');
      const hasAnother = myObject.hasOwnProperty('property');
    `;
    const result = codemod.apply({source});
    expect(result).toMatchSnapshot();
  });

  it('should replace Object.prototype.hasOwnProperty.call() with Object.hasOwn()', () => {
    const source = `
      const has = Object.prototype.hasOwnProperty.call(obj, 'key');
      const hasAnother = Object.prototype.hasOwnProperty.call(myObject, 'property');
    `;
    const result = codemod.apply({source});
    expect(result).toMatchSnapshot();
  });

  it('should handle both patterns in the same code', () => {
    const source = `
      const has1 = obj.hasOwnProperty('key');
      const has2 = Object.prototype.hasOwnProperty.call(obj, 'key');
    `;
    const result = codemod.apply({source});
    expect(result).toMatchSnapshot();
  });

  it('should not change code without hasOwnProperty usage', () => {
    const source = `
      const has = Object.hasOwn(obj, 'key');
      const value = obj.key;
    `;
    const result = codemod.apply({source});
    expect(result).toMatchSnapshot();
  });

  describe('test', () => {
    it('should detect obj.hasOwnProperty()', () => {
      const source = `
        const has = obj.hasOwnProperty('key');
      `;
      expect(codemod.test({source}).hasMatch).toBe(true);
    });

    it('should detect Object.prototype.hasOwnProperty.call()', () => {
      const source = `
        const has = Object.prototype.hasOwnProperty.call(obj, 'key');
      `;
      expect(codemod.test({source}).hasMatch).toBe(true);
    });

    it('should not detect when there is no hasOwnProperty usage', () => {
      const source = `
        const has = Object.hasOwn(obj, 'key');
      `;
      expect(codemod.test({source}).hasMatch).toBe(false);
    });
  });
});

import {describe, it, expect} from 'vitest';
import {codemod} from './spread-syntax.js';

describe('spread-syntax', () => {
  describe('array.concat()', () => {
    it('should replace concat with spread syntax', () => {
      const source = `
        const combined = arr.concat(other);
        const multi = arr.concat(a, b, c);
      `;
      const result = codemod.apply({source});
      expect(result).toMatchSnapshot();
    });

    it('should replace concat with array literal', () => {
      const source = `
        const result = arr.concat([1, 2, 3]);
      `;
      const result = codemod.apply({source});
      expect(result).toMatchSnapshot();
    });

    it('should not change code without concat', () => {
      const source = `
        const arr = [1, 2, 3];
        const pushed = arr.push(4);
      `;
      const result = codemod.apply({source});
      expect(result).toMatchSnapshot();
    });
  });

  describe('Object.assign()', () => {
    it('should replace Object.assign({}, ...) with spread syntax', () => {
      const source = `
        const merged = Object.assign({}, obj1, obj2);
        const triple = Object.assign({}, a, b, c);
      `;
      const result = codemod.apply({source});
      expect(result).toMatchSnapshot();
    });

    it('should not change Object.assign with non-empty first argument', () => {
      const source = `
        const mutated = Object.assign(target, source);
      `;
      const result = codemod.apply({source});
      expect(result).toMatchSnapshot();
    });
  });

  describe('function.apply()', () => {
    it('should replace apply(null, args) with spread syntax', () => {
      const source = `
        const result = fn.apply(null, args);
        const max = Math.max.apply(null, numbers);
      `;
      const result = codemod.apply({source});
      expect(result).toMatchSnapshot();
    });

    it('should replace apply(undefined, args) with spread syntax', () => {
      const source = `
        const result = fn.apply(undefined, args);
      `;
      const result = codemod.apply({source});
      expect(result).toMatchSnapshot();
    });

    it('should not change apply with context object', () => {
      const source = `
        const result = fn.apply(context, args);
      `;
      const result = codemod.apply({source});
      expect(result).toMatchSnapshot();
    });
  });

  describe('test', () => {
    it('should detect array.concat()', () => {
      const source = `const result = arr.concat(other);`;
      expect(codemod.test({source}).hasMatch).toBe(true);
    });

    it('should detect Object.assign({}, ...)', () => {
      const source = `const result = Object.assign({}, obj);`;
      expect(codemod.test({source}).hasMatch).toBe(true);
    });

    it('should detect function.apply(null, args)', () => {
      const source = `const result = fn.apply(null, args);`;
      expect(codemod.test({source}).hasMatch).toBe(true);
    });

    it('should detect function.apply(undefined, args)', () => {
      const source = `const result = fn.apply(undefined, args);`;
      expect(codemod.test({source}).hasMatch).toBe(true);
    });

    it('should not detect when no patterns match', () => {
      const source = `
        const arr = [1, 2, 3];
        const obj = {a: 1};
      `;
      expect(codemod.test({source}).hasMatch).toBe(false);
    });
  });
});

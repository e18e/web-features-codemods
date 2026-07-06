import {describe, it, expect} from 'vitest';
import {codemod} from './exponentiation.js';

describe('exponentiation', () => {
  it('should replace Math.pow with exponentiation operator', () => {
    const source = `
      const result = Math.pow(2, 3);
      const squared = Math.pow(x, 2);
      const complex = Math.pow(base, exponent);
    `;
    const result = codemod.apply({source});
    expect(result).toMatchSnapshot();
  });

  it('should handle nested Math.pow calls', () => {
    const source = `
      const result = Math.pow(Math.pow(2, 3), 4);
    `;
    const result = codemod.apply({source});
    expect(result).toMatchSnapshot();
  });

  it('should handle Math.pow in expressions', () => {
    const source = `
      const result = Math.pow(a + b, c - d) * 2;
      const value = 10 + Math.pow(x, y);
    `;
    const result = codemod.apply({source});
    expect(result).toMatchSnapshot();
  });

  it('should not change code without Math.pow', () => {
    const source = `
      const result = x ** y;
      const squared = 2 ** 3;
      const value = Math.sqrt(4);
    `;
    const result = codemod.apply({source});
    expect(result).toMatchSnapshot();
  });

  describe('test', () => {
    it('should detect Math.pow usage', () => {
      const source = `
        const result = Math.pow(2, 3);
      `;
      expect(codemod.test({source}).hasMatch).toBe(true);
    });

    it('should not detect when there is no Math.pow', () => {
      const source = `
        const result = x ** y;
      `;
      expect(codemod.test({source}).hasMatch).toBe(false);
    });
  });
});

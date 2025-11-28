import {describe, it, expect} from 'vitest';
import {codemod} from './nullish-coalescing.js';

const {apply} = codemod;

describe('nullish-coalescing', () => {
  describe('ternary patterns', () => {
    it('should replace !== null && !== undefined ternary', () => {
      const source = `
        const result = value !== null && value !== undefined ? value : defaultValue;
      `;
      const result = apply({source});
      expect(result).toMatchSnapshot();
    });

    it('should replace !== undefined && !== null ternary (reversed order)', () => {
      const source = `
        const result = value !== undefined && value !== null ? value : defaultValue;
      `;
      const result = apply({source});
      expect(result).toMatchSnapshot();
    });

    it('should replace === null || === undefined ternary', () => {
      const source = `
        const result = value === null || value === undefined ? defaultValue : value;
      `;
      const result = apply({source});
      expect(result).toMatchSnapshot();
    });

    it('should replace === undefined || === null ternary (reversed order)', () => {
      const source = `
        const result = value === undefined || value === null ? defaultValue : value;
      `;
      const result = apply({source});
      expect(result).toMatchSnapshot();
    });

    it('should replace loose != null ternary', () => {
      const source = `
        const result = value != null ? value : defaultValue;
      `;
      const result = apply({source});
      expect(result).toMatchSnapshot();
    });

    it('should replace loose == null ternary', () => {
      const source = `
        const result = value == null ? defaultValue : value;
      `;
      const result = apply({source});
      expect(result).toMatchSnapshot();
    });

    it('should handle complex expressions', () => {
      const source = `
        const name = user.name !== null && user.name !== undefined ? user.name : 'Anonymous';
        const count = obj.prop != null ? obj.prop : 0;
      `;
      const result = apply({source});
      expect(result).toMatchSnapshot();
    });
  });

  describe('if statement patterns', () => {
    it('should replace if statement with === null || === undefined', () => {
      const source = `
        if (x === null || x === undefined) { x = 5 }
      `;
      const result = apply({source});
      expect(result).toMatchSnapshot();
    });

    it('should replace if statement with === undefined || === null', () => {
      const source = `
        if (x === undefined || x === null) { x = 5 }
      `;
      const result = apply({source});
      expect(result).toMatchSnapshot();
    });

    it('should replace if statement with loose == null', () => {
      const source = `
        if (x == null) { x = 5 }
      `;
      const result = apply({source});
      expect(result).toMatchSnapshot();
    });

    it('should replace multiline if statement', () => {
      const source = `
        if (x === null || x === undefined) {
          x = 5
        }
      `;
      const result = apply({source});
      expect(result).toMatchSnapshot();
    });
  });

  describe('mixed patterns', () => {
    it('should handle multiple patterns in one file', () => {
      const source = `
        const a = x !== null && x !== undefined ? x : 'default';
        const b = y == null ? 'fallback' : y;
        if (z === null || z === undefined) { z = 10 }
      `;
      const result = apply({source});
      expect(result).toMatchSnapshot();
    });
  });

  describe('no transformation cases', () => {
    it('should not change code already using nullish coalescing', () => {
      const source = `
        const result = value ?? defaultValue;
        x ??= 5;
      `;
      const result = apply({source});
      expect(result).toMatchSnapshot();
    });

    it('should not change other ternary patterns', () => {
      const source = `
        const result = value !== null ? value : defaultValue;
        const other = value === undefined ? defaultValue : value;
      `;
      const result = apply({source});
      expect(result).toMatchSnapshot();
    });
  });

  describe('test', () => {
    it('should detect ternary with !== null && !== undefined', () => {
      const source = `
        const result = value !== null && value !== undefined ? value : defaultValue;
      `;
      expect(codemod.test({source})).toBe(true);
    });

    it('should detect ternary with === null || === undefined', () => {
      const source = `
        const result = value === null || value === undefined ? defaultValue : value;
      `;
      expect(codemod.test({source})).toBe(true);
    });

    it('should detect loose equality ternary', () => {
      const source = `
        const result = value != null ? value : defaultValue;
      `;
      expect(codemod.test({source})).toBe(true);
    });

    it('should detect if statement with nullish assignment', () => {
      const source = `
        if (x === null || x === undefined) { x = 5 }
      `;
      expect(codemod.test({source})).toBe(true);
    });

    it('should not detect when already using nullish coalescing', () => {
      const source = `
        const result = value ?? defaultValue;
      `;
      expect(codemod.test({source})).toBe(false);
    });

    it('should not detect other patterns', () => {
      const source = `
        const result = value !== null ? value : defaultValue;
      `;
      expect(codemod.test({source})).toBe(false);
    });
  });
});

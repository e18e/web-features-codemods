import {describe, it, expect} from 'vitest';
import {codemod} from './array-to-reversed.js';

const {apply} = codemod;

describe('array-to-reversed', () => {
  it('replaces concat().reverse() with toReversed()', () => {
    const source = 'const reversed = arr.concat().reverse();';
    const result = apply({source});
    expect(result).toBe('const reversed = arr.toReversed();');
  });

  it('replaces slice().reverse() with toReversed()', () => {
    const source = 'const reversed = arr.slice().reverse();';
    const result = apply({source});
    expect(result).toBe('const reversed = arr.toReversed();');
  });

  it('replaces slice(0).reverse() with toReversed()', () => {
    const source = 'const reversed = arr.slice(0).reverse();';
    const result = apply({source});
    expect(result).toBe('const reversed = arr.toReversed();');
  });

  it('replaces [...array].reverse() with toReversed()', () => {
    const source = 'const reversed = [...arr].reverse();';
    const result = apply({source});
    expect(result).toBe('const reversed = arr.toReversed();');
  });

  it('does not change other code', () => {
    const source = 'const notReversed = arr.reverse();';
    const result = apply({source});
    expect(result).toBe(source);
  });

  it('handles member expressions', () => {
    const source = 'const reversed = obj.arr.concat().reverse();';
    const result = apply({source});
    expect(result).toBe('const reversed = obj.arr.toReversed();');
  });

  describe('test', () => {
    it('should detect slice().reverse() pattern', () => {
      const source = 'const reversed = arr.slice().reverse();';
      expect(codemod.test({source}).hasMatch).toBe(true);
    });

    it('should detect [...array].reverse() pattern', () => {
      const source = 'const reversed = [...arr].reverse();';
      expect(codemod.test({source}).hasMatch).toBe(true);
    });

    it('should not detect direct reverse() calls', () => {
      const source = 'const reversed = arr.reverse();';
      expect(codemod.test({source}).hasMatch).toBe(false);
    });

    it('should not detect when there is no reverse pattern', () => {
      const source = 'const arr = [1, 2, 3];';
      expect(codemod.test({source}).hasMatch).toBe(false);
    });
  });
});

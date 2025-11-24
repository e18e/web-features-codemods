import {describe, it, expect} from 'vitest';
import {apply} from './array-to-reversed.js';

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
});

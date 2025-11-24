import {describe, it, expect} from 'vitest';
import {apply} from './array-to-sorted.js';

describe('array-to-sorted', () => {
  it('should convert concat().sort() to toSorted()', () => {
    const source = 'const sorted = arr.concat().sort((a, b) => a - b);';
    const result = apply({source});
    expect(result).toBe('const sorted = arr.toSorted((a, b) => a - b);');
  });

  it('should convert slice().sort() to toSorted()', () => {
    const source = 'const sorted = arr.slice().sort();';
    const result = apply({source});
    expect(result).toBe('const sorted = arr.toSorted();');
  });

  it('should convert slice(0).sort() to toSorted()', () => {
    const source = 'const sorted = arr.slice(0).sort((a, b) => b - a);';
    const result = apply({source});
    expect(result).toBe('const sorted = arr.toSorted((a, b) => b - a);');
  });

  it('should convert [...arr].sort() to toSorted()', () => {
    const source = 'const sorted = [...arr].sort();';
    const result = apply({source});
    expect(result).toBe('const sorted = arr.toSorted();');
  });

  it('should handle no arguments in sort()', () => {
    const source = 'const sorted = arr.concat().sort();';
    const result = apply({source});
    expect(result).toBe('const sorted = arr.toSorted();');
  });

  it('should handle multiple arguments in sort()', () => {
    const source = 'const sorted = arr.slice().sort(arg1, arg2);';
    const result = apply({source});
    expect(result).toBe('const sorted = arr.toSorted(arg1, arg2);');
  });

  it('should not change code without matching patterns', () => {
    const source = 'const notSorted = arr.map(x => x * 2);';
    const result = apply({source});
    expect(result).toBe(source);
  });
});

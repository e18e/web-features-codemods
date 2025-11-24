import {describe, it, expect} from 'vitest';
import {apply} from './array-to-spliced.js';

describe('array-to-spliced', () => {
  it('should transform concat().splice() to toSpliced()', () => {
    const source = `arr.concat().splice(0, 1)`;
    const result = apply({source});
    expect(result).toBe(`arr.toSpliced(0, 1)`);
  });

  it('should transform slice().splice() to toSpliced()', () => {
    const source = `arr.slice().splice(2, 3)`;
    const result = apply({source});
    expect(result).toBe(`arr.toSpliced(2, 3)`);
  });

  it('should transform slice(0).splice() to toSpliced()', () => {
    const source = `arr.slice(0).splice(1, 2)`;
    const result = apply({source});
    expect(result).toBe(`arr.toSpliced(1, 2)`);
  });

  it('should transform [...arr].splice() to toSpliced()', () => {
    const source = `[...arr].splice(3, 4)`;
    const result = apply({source});
    expect(result).toBe(`arr.toSpliced(3, 4)`);
  });

  it('should handle multiple arguments in splice', () => {
    const source = `arr.concat().splice(1, 2, 'a', 'b')`;
    const result = apply({source});
    expect(result).toBe(`arr.toSpliced(1, 2, 'a', 'b')`);
  });

  it('should not transform unrelated code', () => {
    const source = `arr.splice(0, 1)`;
    const result = apply({source});
    expect(result).toBe(`arr.splice(0, 1)`);
  });
});

import {describe, it, expect} from 'vitest';
import {codemod} from './array-fill.js';

const {apply} = codemod;

describe('array-fill', () => {
  it('should transform Array.from({length: n}, () => value) to .fill()', () => {
    const source = `const arr = Array.from({length: 5}, () => 0);`;
    const result = apply({source});
    expect(result).toBe(`const arr = Array.from({length: 5}).fill(0);`);
  });

  it('should transform [...Array(n)].map(() => value) to .fill()', () => {
    const source = `const arr = [...Array(5)].map(() => 0);`;
    const result = apply({source});
    expect(result).toBe(`const arr = Array(5).fill(0);`);
  });

  it('should transform for loop array filling', () => {
    const source = `const arr = new Array(5);
for (let i = 0; i < arr.length; i++) { arr[i] = 0; }`;
    const result = apply({source});
    expect(result).toMatchSnapshot();
  });

  it('should not transform when value depends on loop variable', () => {
    const source = `const arr = new Array(5);
for (let i = 0; i < arr.length; i++) { arr[i] = i; }`;
    const result = apply({source});
    expect(result).toBe(source);
  });

  it('should not transform when value depends on array', () => {
    const source = `const arr = new Array(5);
for (let i = 0; i < arr.length; i++) { arr[i] = arr[0]; }`;
    const result = apply({source});
    expect(result).toBe(source);
  });

  it('should not transform when value contains loop variable in expression', () => {
    const source = `const arr = new Array(5);
for (let i = 0; i < arr.length; i++) { arr[i] = i + 1; }`;
    const result = apply({source});
    expect(result).toBe(source);
  });

  it('should transform multiple matches', () => {
    const source = `const arr1 = Array.from({length: 5}, () => 0);
const arr2 = [...Array(3)].map(() => 'test');`;
    const result = apply({source});
    expect(result).toMatchSnapshot();
  });

  it('should not transform Array.from with index parameter', () => {
    const source = `const arr = Array.from({length: 5}, (_, i) => i);`;
    const result = apply({source});
    expect(result).toBe(source);
  });

  it('should not transform map with index parameter', () => {
    const source = `const arr = [...Array(5)].map((_, i) => i);`;
    const result = apply({source});
    expect(result).toBe(source);
  });

  it('should handle expressions in size parameter', () => {
    const source = `const arr = Array.from({length: 2 + 3}, () => 0);`;
    const result = apply({source});
    expect(result).toBe(`const arr = Array.from({length: 2 + 3}).fill(0);`);
  });

  it('should transform for loops with let variable', () => {
    const source = `let arr = new Array(5);
for (let i = 0; i < arr.length; i++) { arr[i] = 1; }`;
    const result = apply({source});
    expect(result).toMatchSnapshot();
  });

  it('should not transform if multiple for loops', () => {
    const source = `const arr = new Array(5);
for (let i = 0; i < arr.length; i++) { arr[i] = 0; }
for (let i = 0; i < arr.length; i++) { arr[i] = 1; }`;
    const result = apply({source});
    expect(result).toBe(source);
  });

  it('should transform for loops with declaration list', () => {
    const source = `const foo = 303, arr = new Array(5);
for (let i = 0; i < arr.length; i++) { arr[i] = foo; }`;
    const result = apply({source});
    expect(result).toMatchSnapshot();
  });

  it('should transform for loop with push', () => {
    const source = `const arr = [];
for (let i = 0; i < 5; i++) { arr.push(0); }`;
    const result = apply({source});
    expect(result).toMatchSnapshot();
  });

  it('should not transform push when value depends on loop variable', () => {
    const source = `const arr = [];
for (let i = 0; i < 5; i++) { arr.push(i); }`;
    const result = apply({source});
    expect(result).toBe(source);
  });

  it('should not transform push when value depends on array', () => {
    const source = `const arr = [];
for (let i = 0; i < 5; i++) { arr.push(arr.length); }`;
    const result = apply({source});
    expect(result).toBe(source);
  });

  it('should not transform push with multiple for loops', () => {
    const source = `const arr = [];
for (let i = 0; i < 5; i++) { arr.push(0); }
for (let i = 0; i < 5; i++) { arr.push(1); }`;
    const result = apply({source});
    expect(result).toBe(source);
  });

  describe('test', () => {
    it('should detect Array.from with constant callback', () => {
      const source = `const arr = Array.from({length: 5}, () => 0);`;
      expect(codemod.test({source}).hasMatch).toBe(true);
    });

    it('should detect spread Array with map', () => {
      const source = `const arr = [...Array(5)].map(() => 0);`;
      expect(codemod.test({source}).hasMatch).toBe(true);
    });

    it('should detect for loop array filling', () => {
      const source = `const arr = new Array(5);
for (let i = 0; i < arr.length; i++) { arr[i] = 0; }`;
      expect(codemod.test({source}).hasMatch).toBe(true);
    });

    it('should not detect regular array creation', () => {
      const source = `const arr = [1, 2, 3];`;
      expect(codemod.test({source}).hasMatch).toBe(false);
    });

    it('should not detect when there are no fill patterns', () => {
      const source = `const arr = Array.from({length: 5}, (_, i) => i);`;
      expect(codemod.test({source}).hasMatch).toBe(false);
    });
  });
});

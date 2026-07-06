import {describe, it, expect} from 'vitest';
import {codemod} from './array-to-spliced.js';

const {apply} = codemod;

describe('array-to-spliced', () => {
  it('should transform concat() followed by splice() to toSpliced()', () => {
    const source = `const copy = arr.concat();\ncopy.splice(0, 1);`;
    const result = apply({source});
    expect(result).toBe(`const copy = arr.toSpliced(0, 1);\n`);
  });

  it('should transform slice() followed by splice() to toSpliced()', () => {
    const source = `const copy = arr.slice();\ncopy.splice(2, 3);`;
    const result = apply({source});
    expect(result).toBe(`const copy = arr.toSpliced(2, 3);\n`);
  });

  it('should transform slice(0) followed by splice() to toSpliced()', () => {
    const source = `const copy = arr.slice(0);\ncopy.splice(1, 2);`;
    const result = apply({source});
    expect(result).toBe(`const copy = arr.toSpliced(1, 2);\n`);
  });

  it('should transform spread followed by splice() to toSpliced()', () => {
    const source = `const copy = [...arr];\ncopy.splice(3, 4);`;
    const result = apply({source});
    expect(result).toBe(`const copy = arr.toSpliced(3, 4);\n`);
  });

  it('should handle multiple arguments in splice', () => {
    const source = `const copy = arr.concat();\ncopy.splice(1, 2, 'a', 'b');`;
    const result = apply({source});
    expect(result).toBe(`const copy = arr.toSpliced(1, 2, 'a', 'b');\n`);
  });

  it('should not transform when variable names do not match', () => {
    const source = `const copy = arr.concat();\nother.splice(0, 1);`;
    const result = apply({source});
    expect(result).toBe(`const copy = arr.concat();\nother.splice(0, 1);`);
  });

  it('should not transform direct splice() calls without cloning', () => {
    const source = `arr.splice(0, 1);`;
    const result = apply({source});
    expect(result).toBe(`arr.splice(0, 1);`);
  });

  it('should handle multiple transformations in the same file', () => {
    const source = `const a = arr1.slice();\na.splice(0, 1);\nconst b = arr2.concat();\nb.splice(2, 3);`;
    const result = apply({source});
    expect(result).toBe(
      `const a = arr1.toSpliced(0, 1);\n\nconst b = arr2.toSpliced(2, 3);\n`
    );
  });

  describe('test', () => {
    it('should detect slice() followed by splice() pattern', () => {
      const source = `const copy = arr.slice();\ncopy.splice(0, 1);`;
      expect(codemod.test({source}).hasMatch).toBe(true);
    });

    it('should detect spread followed by splice() pattern', () => {
      const source = `const copy = [...arr];\ncopy.splice(0, 1);`;
      expect(codemod.test({source}).hasMatch).toBe(true);
    });

    it('should not detect direct splice() calls', () => {
      const source = `arr.splice(0, 1);`;
      expect(codemod.test({source}).hasMatch).toBe(false);
    });

    it('should not detect when variable names do not match', () => {
      const source = `const copy = arr.slice();\nother.splice(0, 1);`;
      expect(codemod.test({source}).hasMatch).toBe(false);
    });

    it('should not detect when there is no splice pattern', () => {
      const source = `const arr = [1, 2, 3];`;
      expect(codemod.test({source}).hasMatch).toBe(false);
    });
  });
});

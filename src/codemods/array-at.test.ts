import {describe, it, expect} from 'vitest';
import {apply} from './array-at.js';

describe('array-at', () => {
  it('should replace array length - 1 with at(-1)', () => {
    const source = `
      const lastItem = myArray[myArray.length - 1];
      const anotherLastItem = anotherArray[anotherArray.length - 1];
    `;
    const result = apply({source});
    expect(result).toMatchSnapshot();
  });

  it('should not change code without array length - 1 access', () => {
    const source = `
      const firstItem = myArray[0];
      const length = myArray.length;
    `;
    const result = apply({source});
    expect(result).toMatchSnapshot();
  });
});

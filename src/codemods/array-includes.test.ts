import {describe, it, expect} from 'vitest';
import {apply} from './array-includes.js';

describe('array-includes', () => {
  it('should replace indexOf !== -1 with includes', () => {
    const source = `
      if (arr.indexOf(item) !== -1) {
        console.log('found');
      }
    `;
    const result = apply({source});
    expect(result).toMatchSnapshot();
  });

  it('should replace indexOf != -1 with includes', () => {
    const source = `
      if (arr.indexOf(item) != -1) {
        console.log('found');
      }
    `;
    const result = apply({source});
    expect(result).toMatchSnapshot();
  });

  it('should replace indexOf > -1 with includes', () => {
    const source = `
      if (arr.indexOf(item) > -1) {
        console.log('found');
      }
    `;
    const result = apply({source});
    expect(result).toMatchSnapshot();
  });

  it('should replace indexOf >= 0 with includes', () => {
    const source = `
      if (arr.indexOf(item) >= 0) {
        console.log('found');
      }
    `;
    const result = apply({source});
    expect(result).toMatchSnapshot();
  });

  it('should handle reversed positive comparisons', () => {
    const source = `
      if (-1 !== arr.indexOf(item)) {
        console.log('found');
      }
      if (-1 < myArray.indexOf(value)) {
        console.log('exists');
      }
      if (0 <= items.indexOf(x)) {
        console.log('present');
      }
    `;
    const result = apply({source});
    expect(result).toMatchSnapshot();
  });

  it('should replace indexOf === -1 with !includes', () => {
    const source = `
      if (arr.indexOf(item) === -1) {
        console.log('not found');
      }
    `;
    const result = apply({source});
    expect(result).toMatchSnapshot();
  });

  it('should replace indexOf == -1 with !includes', () => {
    const source = `
      if (arr.indexOf(item) == -1) {
        console.log('not found');
      }
    `;
    const result = apply({source});
    expect(result).toMatchSnapshot();
  });

  it('should replace indexOf < 0 with !includes', () => {
    const source = `
      if (arr.indexOf(item) < 0) {
        console.log('not found');
      }
    `;
    const result = apply({source});
    expect(result).toMatchSnapshot();
  });

  it('should handle reversed negative comparisons', () => {
    const source = `
      if (-1 === arr.indexOf(item)) {
        console.log('not found');
      }
      if (0 > myArray.indexOf(value)) {
        console.log('missing');
      }
    `;
    const result = apply({source});
    expect(result).toMatchSnapshot();
  });

  it('should handle multiple patterns in one file', () => {
    const source = `
      const hasItem = arr.indexOf(item) !== -1;
      const missingItem = arr.indexOf(other) === -1;
      if (list.indexOf(value) > -1) {
        doSomething();
      }
      if (-1 === items.indexOf(x)) {
        handleMissing();
      }
    `;
    const result = apply({source});
    expect(result).toMatchSnapshot();
  });

  it('should handle bitwise NOT operator for positive checks', () => {
    const source = `
      if (~arr.indexOf(item)) {
        console.log('found');
      }
      const hasValue = ~items.indexOf(value);
    `;
    const result = apply({source});
    expect(result).toMatchSnapshot();
  });

  it('should handle negated bitwise NOT operator for negative checks', () => {
    const source = `
      if (!~arr.indexOf(item)) {
        console.log('not found');
      }
      const missingValue = !~items.indexOf(value);
    `;
    const result = apply({source});
    expect(result).toMatchSnapshot();
  });

  it('should not change code without indexOf checks', () => {
    const source = `
      const index = arr.indexOf(item);
      const found = arr.includes(item);
      if (x === -1) {
        console.log('negative one');
      }
    `;
    const result = apply({source});
    expect(result).toMatchSnapshot();
  });
});

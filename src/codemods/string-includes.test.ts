import {describe, it, expect} from 'vitest';
import {codemod} from './string-includes.js';

const {apply} = codemod;

describe('string-includes', () => {
  it('should replace indexOf !== -1 with includes', () => {
    const source = `
      if (str.indexOf('hello') !== -1) {
        console.log('found');
      }
    `;
    const result = apply({source});
    expect(result).toMatchSnapshot();
  });

  it('should replace indexOf != -1 with includes', () => {
    const source = `
      if (str.indexOf('world') != -1) {
        console.log('found');
      }
    `;
    const result = apply({source});
    expect(result).toMatchSnapshot();
  });

  it('should replace indexOf > -1 with includes', () => {
    const source = `
      if (text.indexOf(searchTerm) > -1) {
        console.log('found');
      }
    `;
    const result = apply({source});
    expect(result).toMatchSnapshot();
  });

  it('should replace indexOf >= 0 with includes', () => {
    const source = `
      if (message.indexOf('error') >= 0) {
        console.log('found');
      }
    `;
    const result = apply({source});
    expect(result).toMatchSnapshot();
  });

  it('should handle reversed positive comparisons', () => {
    const source = `
      if (-1 !== str.indexOf('test')) {
        console.log('found');
      }
      if (-1 < content.indexOf(pattern)) {
        console.log('exists');
      }
      if (0 <= text.indexOf(query)) {
        console.log('present');
      }
    `;
    const result = apply({source});
    expect(result).toMatchSnapshot();
  });

  it('should replace indexOf === -1 with !includes', () => {
    const source = `
      if (str.indexOf('missing') === -1) {
        console.log('not found');
      }
    `;
    const result = apply({source});
    expect(result).toMatchSnapshot();
  });

  it('should replace indexOf == -1 with !includes', () => {
    const source = `
      if (str.indexOf('absent') == -1) {
        console.log('not found');
      }
    `;
    const result = apply({source});
    expect(result).toMatchSnapshot();
  });

  it('should replace indexOf < 0 with !includes', () => {
    const source = `
      if (text.indexOf(keyword) < 0) {
        console.log('not found');
      }
    `;
    const result = apply({source});
    expect(result).toMatchSnapshot();
  });

  it('should handle reversed negative comparisons', () => {
    const source = `
      if (-1 === str.indexOf('missing')) {
        console.log('not found');
      }
      if (0 > content.indexOf(search)) {
        console.log('absent');
      }
    `;
    const result = apply({source});
    expect(result).toMatchSnapshot();
  });

  it('should handle multiple patterns in one file', () => {
    const source = `
      const hasWord = str.indexOf('word') !== -1;
      const missingWord = str.indexOf('other') === -1;
      if (text.indexOf(pattern) > -1) {
        doSomething();
      }
      if (-1 === content.indexOf(search)) {
        handleMissing();
      }
    `;
    const result = apply({source});
    expect(result).toMatchSnapshot();
  });

  it('should handle bitwise NOT operator for positive checks', () => {
    const source = `
      if (~str.indexOf('substring')) {
        console.log('found');
      }
      const hasPattern = ~text.indexOf(pattern);
    `;
    const result = apply({source});
    expect(result).toMatchSnapshot();
  });

  it('should handle negated bitwise NOT operator for negative checks', () => {
    const source = `
      if (!~str.indexOf('substring')) {
        console.log('not found');
      }
      const missingPattern = !~text.indexOf(pattern);
    `;
    const result = apply({source});
    expect(result).toMatchSnapshot();
  });

  it('should not change code without indexOf checks', () => {
    const source = `
      const index = str.indexOf('test');
      const found = str.includes('test');
      if (x === -1) {
        console.log('negative one');
      }
    `;
    const result = apply({source});
    expect(result).toMatchSnapshot();
  });

  it('should handle method chaining', () => {
    const source = `
      if (str.toLowerCase().indexOf('hello') !== -1) {
        console.log('found');
      }
      if (text.trim().indexOf(pattern) === -1) {
        console.log('not found');
      }
    `;
    const result = apply({source});
    expect(result).toMatchSnapshot();
  });

  it('should not transform indexOf with position parameter', () => {
    const source = `
      if (str.indexOf('test', 5) !== -1) {
        console.log('found after position 5');
      }
      if (text.indexOf(pattern, startPos) === -1) {
        console.log('not found from start position');
      }
    `;
    const result = apply({source});
    expect(result).toMatchSnapshot();
  });

  describe('test', () => {
    it('should detect indexOf comparison patterns', () => {
      const source = `
        if (str.indexOf('test') !== -1) {
          console.log('found');
        }
      `;
      expect(codemod.test({source}).hasMatch).toBe(true);
    });

    it('should detect bitwise NOT patterns', () => {
      const source = `
        if (~str.indexOf('test')) {
          console.log('found');
        }
      `;
      expect(codemod.test({source}).hasMatch).toBe(true);
    });

    it('should not detect when already using includes', () => {
      const source = `
        if (str.includes('test')) {
          console.log('found');
        }
      `;
      expect(codemod.test({source}).hasMatch).toBe(false);
    });

    it('should not detect plain indexOf calls', () => {
      const source = `
        const index = str.indexOf('test');
      `;
      expect(codemod.test({source}).hasMatch).toBe(false);
    });
  });
});

import {describe, it, expect} from 'vitest';
import {apply} from './postcss-sign-functions.js';

describe('postcss-sign-functions', () => {
  it('removes usages of postcss-sign-functions and its imports', () => {
    const source = `
      import signFunctions from '@csstools/postcss-sign-functions';

      postcss([
        signFunctions()
      ]).process(source);
    `;
    const result = apply({source});
    expect(result).toMatchSnapshot();
  });

  it('removes usages with options', () => {
    const source = `
      const signFunctions = require('@csstools/postcss-sign-functions');

      postcss([
        signFunctions({ option: true })
      ]).process(source);
    `;
    const result = apply({source});
    expect(result).toMatchSnapshot();
  });

  it('handles no usages', () => {
    const source = `
      import otherPlugin from 'some-other-plugin';

      postcss([
        otherPlugin()
      ]).process(source);
    `;
    const result = apply({source});
    expect(result).toMatchSnapshot();
  });

  it('handles require syntax', () => {
    const source = `
      const signFunctions = require('@csstools/postcss-sign-functions');

      postcss([
        signFunctions()
      ]).process(source);
    `;
    const result = apply({source});
    expect(result).toMatchSnapshot();
  });
});

import {describe, it, expect} from 'vitest';
import {codemod} from './postcss-sign-functions.js';

const {apply} = codemod;

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

  describe('test', () => {
    it('should detect postcss-sign-functions import', () => {
      const source = `
        import signFunctions from '@csstools/postcss-sign-functions';
        postcss([signFunctions()]).process(source);
      `;
      expect(codemod.test({source}).hasMatch).toBe(true);
    });

    it('should detect postcss-sign-functions require', () => {
      const source = `
        const signFunctions = require('@csstools/postcss-sign-functions');
      `;
      expect(codemod.test({source}).hasMatch).toBe(true);
    });

    it('should not detect when postcss-sign-functions is not imported', () => {
      const source = `
        import otherPlugin from 'some-other-plugin';
        postcss([otherPlugin()]).process(source);
      `;
      expect(codemod.test({source}).hasMatch).toBe(false);
    });

    it('should not detect in empty code', () => {
      const source = `const x = 1;`;
      expect(codemod.test({source}).hasMatch).toBe(false);
    });
  });
});

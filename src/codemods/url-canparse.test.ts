import {describe, it, expect} from 'vitest';
import {codemod} from './url-canparse.js';

describe('url-canparse', () => {
  it('should replace try-catch boolean return pattern with URL.canParse', () => {
    const source = `
      function isValidUrl(u) {
        try {
          new URL(u);
          return true;
        } catch {
          return false;
        }
      }
    `;
    const result = codemod.apply({source});
    expect(result).toMatchSnapshot();
  });

  it('should replace try-catch with body to if-else with URL.canParse', () => {
    const source = `
      function processUrl(u) {
        try {
          new URL(u);
          console.log('Valid URL');
          doSomething(u);
        } catch {
          console.error('Invalid URL');
        }
      }
    `;
    const result = codemod.apply({source});
    expect(result).toMatchSnapshot();
  });

  it('should handle try-catch with only try body (no catch body)', () => {
    const source = `
      function processUrl(u) {
        try {
          new URL(u);
          console.log('Valid URL');
        } catch {
        }
      }
    `;
    const result = codemod.apply({source});
    expect(result).toMatchSnapshot();
  });

  it('should not change code without URL validation pattern', () => {
    const source = `
      function normalFunction() {
        const url = new URL('https://example.com');
        return url.href;
      }
    `;
    const result = codemod.apply({source});
    expect(result).toMatchSnapshot();
  });

  describe('test', () => {
    it('should detect try-catch boolean return pattern', () => {
      const source = `
        try {
          new URL(u);
          return true;
        } catch {
          return false;
        }
      `;
      expect(codemod.test({source}).hasMatch).toBe(true);
    });

    it('should detect try-catch with body pattern', () => {
      const source = `
        try {
          new URL(u);
          console.log('valid');
        } catch {
          console.log('invalid');
        }
      `;
      expect(codemod.test({source}).hasMatch).toBe(true);
    });

    it('should not detect when there is no URL validation pattern', () => {
      const source = `
        const url = new URL('https://example.com');
      `;
      expect(codemod.test({source}).hasMatch).toBe(false);
    });
  });
});

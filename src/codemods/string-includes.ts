import {parse, Lang, type Edit, type NapiConfig} from '@ast-grep/napi';
import type {Options, CodeMod} from '../shared.js';

const positiveChecksRule: NapiConfig = {
  rule: {
    any: [
      {pattern: '$STRING.indexOf($SUBSTRING) !== -1'},
      {pattern: '$STRING.indexOf($SUBSTRING) != -1'},
      {pattern: '$STRING.indexOf($SUBSTRING) > -1'},
      {pattern: '$STRING.indexOf($SUBSTRING) >= 0'},
      {pattern: '-1 !== $STRING.indexOf($SUBSTRING)'},
      {pattern: '-1 != $STRING.indexOf($SUBSTRING)'},
      {pattern: '-1 < $STRING.indexOf($SUBSTRING)'},
      {pattern: '0 <= $STRING.indexOf($SUBSTRING)'},
      {pattern: '~$STRING.indexOf($SUBSTRING)'}
    ]
  }
};

const negativeChecksRule: NapiConfig = {
  rule: {
    any: [
      {pattern: '$STRING.indexOf($SUBSTRING) === -1'},
      {pattern: '$STRING.indexOf($SUBSTRING) == -1'},
      {pattern: '$STRING.indexOf($SUBSTRING) < 0'},
      {pattern: '-1 === $STRING.indexOf($SUBSTRING)'},
      {pattern: '-1 == $STRING.indexOf($SUBSTRING)'},
      {pattern: '0 > $STRING.indexOf($SUBSTRING)'},
      {pattern: '!~$STRING.indexOf($SUBSTRING)'}
    ]
  }
};

export const codemod: CodeMod = {
  test(options: Options): boolean {
    const ast = parse(Lang.TypeScript, options.source);
    const root = ast.root();

    return root.has(positiveChecksRule) || root.has(negativeChecksRule);
  },
  apply(options: Options): string {
    const ast = parse(Lang.TypeScript, options.source);
    const root = ast.root();
    const edits: Edit[] = [];

    const positiveChecks = root.findAll(positiveChecksRule);

    for (const node of positiveChecks) {
      const string = node.getMatch('STRING');
      const substring = node.getMatch('SUBSTRING');
      if (string && substring) {
        const edit = node.replace(
          `${string.text()}.includes(${substring.text()})`
        );
        edits.push(edit);
      }
    }

    const negativeChecks = root.findAll(negativeChecksRule);

    for (const node of negativeChecks) {
      const string = node.getMatch('STRING');
      const substring = node.getMatch('SUBSTRING');
      if (string && substring) {
        const edit = node.replace(
          `!${string.text()}.includes(${substring.text()})`
        );
        edits.push(edit);
      }
    }

    return root.commitEdits(edits);
  }
};

import {parse, Lang, type Edit, type NapiConfig} from '@ast-grep/napi';
import type {Options, CodeMod} from '../shared.js';

const positiveChecksRule: NapiConfig = {
  rule: {
    any: [
      {pattern: '$ARRAY.indexOf($ELEMENT) !== -1'},
      {pattern: '$ARRAY.indexOf($ELEMENT) != -1'},
      {pattern: '$ARRAY.indexOf($ELEMENT) > -1'},
      {pattern: '$ARRAY.indexOf($ELEMENT) >= 0'},
      {pattern: '-1 !== $ARRAY.indexOf($ELEMENT)'},
      {pattern: '-1 != $ARRAY.indexOf($ELEMENT)'},
      {pattern: '-1 < $ARRAY.indexOf($ELEMENT)'},
      {pattern: '0 <= $ARRAY.indexOf($ELEMENT)'},
      {pattern: '~$ARRAY.indexOf($ELEMENT)'}
    ]
  }
};

const negativeChecksRule: NapiConfig = {
  rule: {
    any: [
      {pattern: '$ARRAY.indexOf($ELEMENT) === -1'},
      {pattern: '$ARRAY.indexOf($ELEMENT) == -1'},
      {pattern: '$ARRAY.indexOf($ELEMENT) < 0'},
      {pattern: '-1 === $ARRAY.indexOf($ELEMENT)'},
      {pattern: '-1 == $ARRAY.indexOf($ELEMENT)'},
      {pattern: '0 > $ARRAY.indexOf($ELEMENT)'},
      {pattern: '!~$ARRAY.indexOf($ELEMENT)'}
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
      const array = node.getMatch('ARRAY');
      const element = node.getMatch('ELEMENT');
      if (array && element) {
        const edit = node.replace(
          `${array.text()}.includes(${element.text()})`
        );
        edits.push(edit);
      }
    }

    const negativeChecks = root.findAll(negativeChecksRule);

    for (const node of negativeChecks) {
      const array = node.getMatch('ARRAY');
      const element = node.getMatch('ELEMENT');
      if (array && element) {
        const edit = node.replace(
          `!${array.text()}.includes(${element.text()})`
        );
        edits.push(edit);
      }
    }

    return root.commitEdits(edits);
  }
};

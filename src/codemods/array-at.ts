import {parse, Lang, type Edit, type NapiConfig} from '@ast-grep/napi';
import type {Options, CodeMod} from '../shared.js';

const arrayLengthLastIndexRule: NapiConfig = {
  rule: {
    pattern: '$ARRAY[$ARRAY.length - 1]'
  }
};

export const codemod: CodeMod = {
  test(options: Options): boolean {
    const ast = parse(Lang.TypeScript, options.source);
    const root = ast.root();

    return root.has(arrayLengthLastIndexRule);
  },
  apply(options: Options): string {
    const ast = parse(Lang.TypeScript, options.source);
    const root = ast.root();

    const arrayLengthLastIndex = root.findAll(arrayLengthLastIndexRule);
    const edits: Edit[] = [];

    for (const node of arrayLengthLastIndex) {
      const array = node.getMatch('ARRAY');
      if (array) {
        const edit = node.replace(`${array.text()}.at(-1)`);
        edits.push(edit);
      }
    }

    return root.commitEdits(edits);
  }
};

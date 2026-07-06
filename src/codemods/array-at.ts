import {parse, Lang, type Edit, type NapiConfig} from '@ast-grep/napi';
import type {Options, CodeMod, TestResult} from '../shared.js';
import {getRangeForNode} from '../typescript-utils.js';

const arrayLengthLastIndexRule: NapiConfig = {
  rule: {
    pattern: '$ARRAY[$ARRAY.length - 1]'
  }
};

export const codemod: CodeMod = {
  test(options: Options): TestResult {
    const ast = parse(Lang.TypeScript, options.source);
    const root = ast.root();

    const node = root.find(arrayLengthLastIndexRule);
    return node
      ? {hasMatch: true, range: getRangeForNode(node)}
      : {hasMatch: false};
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

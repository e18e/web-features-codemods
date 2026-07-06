import {parse, Lang, type Edit, type NapiConfig} from '@ast-grep/napi';
import type {Options, CodeMod, TestResult} from '../shared.js';
import {getRangeForNode} from '../typescript-utils.js';

const arrayToReversedRule: NapiConfig = {
  rule: {
    any: [
      {
        pattern: '$ARRAY.concat().reverse()'
      },
      {
        pattern: '$ARRAY.slice().reverse()'
      },
      {
        pattern: '$ARRAY.slice(0).reverse()'
      },
      {
        pattern: '[...$ARRAY].reverse()'
      }
    ]
  }
};

export const codemod: CodeMod = {
  test(options: Options): TestResult {
    const ast = parse(Lang.TypeScript, options.source);
    const root = ast.root();

    const node = root.find(arrayToReversedRule);
    return node
      ? {hasMatch: true, range: getRangeForNode(node)}
      : {hasMatch: false};
  },
  apply(options: Options): string {
    const ast = parse(Lang.TypeScript, options.source);
    const root = ast.root();

    const nodes = root.findAll(arrayToReversedRule);
    const edits: Edit[] = [];

    for (const node of nodes) {
      const array = node.getMatch('ARRAY');
      if (array) {
        const edit = node.replace(`${array.text()}.toReversed()`);
        edits.push(edit);
      }
    }

    return root.commitEdits(edits);
  }
};

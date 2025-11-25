import {parse, Lang, type Edit, type NapiConfig} from '@ast-grep/napi';
import type {Options, CodeMod} from '../shared.js';
import {getNodesSourceText} from '../typescript-utils.js';

const arrayToSortedRule: NapiConfig = {
  rule: {
    any: [
      {
        pattern: '$ARRAY.concat().sort($$$ARGS)'
      },
      {
        pattern: '$ARRAY.slice().sort($$$ARGS)'
      },
      {
        pattern: '$ARRAY.slice(0).sort($$$ARGS)'
      },
      {
        pattern: '[...$ARRAY].sort($$$ARGS)'
      }
    ]
  }
};

export const codemod: CodeMod = {
  test(options: Options): boolean {
    const ast = parse(Lang.TypeScript, options.source);
    const root = ast.root();

    return root.has(arrayToSortedRule);
  },
  apply(options: Options): string {
    const ast = parse(Lang.TypeScript, options.source);
    const root = ast.root();

    const nodes = root.findAll(arrayToSortedRule);
    const edits: Edit[] = [];

    for (const node of nodes) {
      const array = node.getMatch('ARRAY');
      const args = node.getMultipleMatches('ARGS');
      const argsText = getNodesSourceText(options.source, args);
      if (array) {
        const edit = node.replace(`${array.text()}.toSorted(${argsText})`);
        edits.push(edit);
      }
    }

    return root.commitEdits(edits);
  }
};

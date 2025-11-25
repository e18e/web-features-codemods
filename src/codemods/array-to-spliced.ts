import {parse, Lang, type Edit, type NapiConfig} from '@ast-grep/napi';
import type {Options, CodeMod} from '../shared.js';
import {getNodesSourceText} from '../typescript-utils.js';

const arrayToSplicedRule: NapiConfig = {
  rule: {
    any: [
      {
        pattern: '$ARRAY.concat().splice($$$ARGS)'
      },
      {
        pattern: '$ARRAY.slice().splice($$$ARGS)'
      },
      {
        pattern: '$ARRAY.slice(0).splice($$$ARGS)'
      },
      {
        pattern: '[...$ARRAY].splice($$$ARGS)'
      }
    ]
  }
};

export const codemod: CodeMod = {
  test(options: Options): boolean {
    const ast = parse(Lang.TypeScript, options.source);
    const root = ast.root();

    return root.has(arrayToSplicedRule);
  },
  apply(options: Options): string {
    const ast = parse(Lang.TypeScript, options.source);
    const root = ast.root();

    const nodes = root.findAll(arrayToSplicedRule);
    const edits: Edit[] = [];

    for (const node of nodes) {
      const array = node.getMatch('ARRAY');
      const args = node.getMultipleMatches('ARGS');
      const argsText = getNodesSourceText(options.source, args);
      if (array) {
        const edit = node.replace(`${array.text()}.toSpliced(${argsText})`);
        edits.push(edit);
      }
    }

    return root.commitEdits(edits);
  }
};

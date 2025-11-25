import {parse, Lang, type Edit} from '@ast-grep/napi';
import type {Options} from '../shared.js';
import {getNodesSourceText} from '../typescript-utils.js';

export function apply(options: Options): string {
  const ast = parse(Lang.TypeScript, options.source);
  const root = ast.root();

  const nodes = root.findAll({
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
  });
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

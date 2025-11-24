import {ts, type Edit} from '@ast-grep/napi';
import type {Options} from '../shared.js';
import {getNodesSourceText} from '../typescript-utils.js';

export function apply(options: Options): string {
  const ast = ts.parse(options.source);
  const root = ast.root();

  const nodes = root.findAll({
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
  });
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

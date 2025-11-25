import {parse, Lang, type Edit} from '@ast-grep/napi';
import type {Options} from '../shared.js';

export function apply(options: Options): string {
  const ast = parse(Lang.TypeScript, options.source);
  const root = ast.root();

  const nodes = root.findAll({
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
  });
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

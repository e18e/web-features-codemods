import {ts, type Edit} from '@ast-grep/napi';
import type {Options} from '../shared.js';

export function apply(options: Options): string {
  const ast = ts.parse(options.source);
  const root = ast.root();

  const arrayLengthLastIndex = root.findAll({
    rule: {
      pattern: '$ARRAY[$ARRAY.length - 1]'
    }
  });
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

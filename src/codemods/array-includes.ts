import {parse, Lang, type Edit} from '@ast-grep/napi';
import type {Options} from '../shared.js';

export function apply(options: Options): string {
  const ast = parse(Lang.TypeScript, options.source);
  const root = ast.root();
  const edits: Edit[] = [];

  const positiveChecks = root.findAll({
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
  });

  for (const node of positiveChecks) {
    const array = node.getMatch('ARRAY');
    const element = node.getMatch('ELEMENT');
    if (array && element) {
      const edit = node.replace(`${array.text()}.includes(${element.text()})`);
      edits.push(edit);
    }
  }

  const negativeChecks = root.findAll({
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
  });

  for (const node of negativeChecks) {
    const array = node.getMatch('ARRAY');
    const element = node.getMatch('ELEMENT');
    if (array && element) {
      const edit = node.replace(`!${array.text()}.includes(${element.text()})`);
      edits.push(edit);
    }
  }

  return root.commitEdits(edits);
}

import {parse, Lang, type Edit, type NapiConfig} from '@ast-grep/napi';
import type {Options, CodeMod} from '../shared.js';

const hasOwnPropertyRule: NapiConfig = {
  rule: {
    any: [
      {pattern: '$OBJECT.hasOwnProperty($PROPERTY)'},
      {pattern: 'Object.prototype.hasOwnProperty.call($OBJECT, $PROPERTY)'}
    ]
  }
};

export const codemod: CodeMod = {
  test(options: Options): boolean {
    const ast = parse(Lang.TypeScript, options.source);
    const root = ast.root();

    return root.has(hasOwnPropertyRule);
  },
  apply(options: Options): string {
    const ast = parse(Lang.TypeScript, options.source);
    const root = ast.root();
    const edits: Edit[] = [];

    const hasOwnPropertyCalls = root.findAll(hasOwnPropertyRule);

    for (const node of hasOwnPropertyCalls) {
      const object = node.getMatch('OBJECT');
      const property = node.getMatch('PROPERTY');
      if (object && property) {
        const edit = node.replace(
          `Object.hasOwn(${object.text()}, ${property.text()})`
        );
        edits.push(edit);
      }
    }

    return root.commitEdits(edits);
  }
};

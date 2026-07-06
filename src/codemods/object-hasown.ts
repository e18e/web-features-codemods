import {parse, Lang, type Edit, type NapiConfig} from '@ast-grep/napi';
import type {Options, CodeMod, TestResult} from '../shared.js';
import {getRangeForNode} from '../typescript-utils.js';

const hasOwnPropertyRule: NapiConfig = {
  rule: {
    any: [
      {pattern: '$OBJECT.hasOwnProperty($PROPERTY)'},
      {pattern: 'Object.prototype.hasOwnProperty.call($OBJECT, $PROPERTY)'}
    ]
  }
};

export const codemod: CodeMod = {
  test(options: Options): TestResult {
    const ast = parse(Lang.TypeScript, options.source);
    const root = ast.root();

    const node = root.find(hasOwnPropertyRule);
    return node
      ? {hasMatch: true, range: getRangeForNode(node)}
      : {hasMatch: false};
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

import {parse, Lang, type Edit, type NapiConfig} from '@ast-grep/napi';
import type {Options, CodeMod, TestResult} from '../shared.js';
import {getRangeForNode} from '../typescript-utils.js';

const arrayConcatRule: NapiConfig = {
  rule: {
    pattern: '$ARRAY.concat($$$ARGS)'
  }
};

const objectAssignRule: NapiConfig = {
  rule: {
    pattern: 'Object.assign({}, $$$ARGS)'
  }
};

const functionApplyRule: NapiConfig = {
  rule: {
    any: [
      {
        pattern: '$FN.apply(null, $ARGS)'
      },
      {
        pattern: '$FN.apply(undefined, $ARGS)'
      }
    ]
  }
};

export const codemod: CodeMod = {
  test(options: Options): TestResult {
    const ast = parse(Lang.TypeScript, options.source);
    const root = ast.root();

    const node =
      root.find(arrayConcatRule) ??
      root.find(objectAssignRule) ??
      root.find(functionApplyRule);
    return node
      ? {hasMatch: true, range: getRangeForNode(node)}
      : {hasMatch: false};
  },
  apply(options: Options): string {
    const ast = parse(Lang.TypeScript, options.source);
    const root = ast.root();
    const edits: Edit[] = [];

    const concatNodes = root.findAll(arrayConcatRule);
    for (const node of concatNodes) {
      const array = node.getMatch('ARRAY');
      const args = node
        .getMultipleMatches('ARGS')
        .filter((arg) => arg.kind() !== ',');

      if (array && args.length > 0) {
        const spreadParts = [
          array.text(),
          ...args.map((arg) => arg.text())
        ].map((part) => `...${part}`);
        const replacement = `[${spreadParts.join(', ')}]`;
        edits.push(node.replace(replacement));
      }
    }

    const assignNodes = root.findAll(objectAssignRule);
    for (const node of assignNodes) {
      const args = node
        .getMultipleMatches('ARGS')
        .filter((arg) => arg.kind() !== ',');

      if (args.length > 0) {
        const spreadParts = args.map((arg) => `...${arg.text()}`);
        const replacement = `{${spreadParts.join(', ')}}`;
        edits.push(node.replace(replacement));
      }
    }

    const applyNodes = root.findAll(functionApplyRule);
    for (const node of applyNodes) {
      const fn = node.getMatch('FN');
      const args = node.getMatch('ARGS');

      if (fn && args) {
        const replacement = `${fn.text()}(...${args.text()})`;
        edits.push(node.replace(replacement));
      }
    }

    return root.commitEdits(edits);
  }
};

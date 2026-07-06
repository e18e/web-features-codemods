import {parse, Lang, type Edit, type NapiConfig} from '@ast-grep/napi';
import type {Options, CodeMod, TestResult} from '../shared.js';
import {getRangeForNode} from '../typescript-utils.js';

const ternaryPatterns: NapiConfig = {
  rule: {
    any: [
      {pattern: '$VALUE !== null && $VALUE !== undefined ? $VALUE : $DEFAULT'},
      {pattern: '$VALUE !== undefined && $VALUE !== null ? $VALUE : $DEFAULT'},
      {pattern: '$VALUE === null || $VALUE === undefined ? $DEFAULT : $VALUE'},
      {pattern: '$VALUE === undefined || $VALUE === null ? $DEFAULT : $VALUE'},
      {pattern: '$VALUE != null ? $VALUE : $DEFAULT'},
      {pattern: '$VALUE == null ? $DEFAULT : $VALUE'}
    ]
  }
};

const ifNullishAssignment: NapiConfig = {
  rule: {
    any: [
      {
        pattern:
          'if ($VALUE === null || $VALUE === undefined) { $VALUE = $DEFAULT }'
      },
      {
        pattern:
          'if ($VALUE === undefined || $VALUE === null) { $VALUE = $DEFAULT }'
      },
      {pattern: 'if ($VALUE == null) { $VALUE = $DEFAULT }'}
    ]
  }
};

export const codemod: CodeMod = {
  test(options: Options): TestResult {
    const ast = parse(Lang.TypeScript, options.source);
    const root = ast.root();

    const node = root.find(ternaryPatterns) ?? root.find(ifNullishAssignment);
    return node
      ? {hasMatch: true, range: getRangeForNode(node)}
      : {hasMatch: false};
  },
  apply(options: Options): string {
    const ast = parse(Lang.TypeScript, options.source);
    const root = ast.root();
    const edits: Edit[] = [];

    const ternaryMatches = root.findAll(ternaryPatterns);
    for (const node of ternaryMatches) {
      const value = node.getMatch('VALUE');
      const defaultVal = node.getMatch('DEFAULT');
      if (value && defaultVal) {
        const edit = node.replace(`${value.text()} ?? ${defaultVal.text()}`);
        edits.push(edit);
      }
    }

    const ifNullishMatches = root.findAll(ifNullishAssignment);
    for (const node of ifNullishMatches) {
      const value = node.getMatch('VALUE');
      const defaultVal = node.getMatch('DEFAULT');
      if (value && defaultVal) {
        const edit = node.replace(`${value.text()} ??= ${defaultVal.text()}`);
        edits.push(edit);
      }
    }

    return root.commitEdits(edits);
  }
};

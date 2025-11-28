import {parse, Lang, type Edit, type NapiConfig} from '@ast-grep/napi';
import type {Options, CodeMod} from '../shared.js';

const mathPowRule: NapiConfig = {
  rule: {
    pattern: 'Math.pow($BASE, $EXPONENT)'
  }
};

export const codemod: CodeMod = {
  test(options: Options): boolean {
    const ast = parse(Lang.TypeScript, options.source);
    const root = ast.root();

    return root.has(mathPowRule);
  },
  apply(options: Options): string {
    let source = options.source;

    while (true) {
      const ast = parse(Lang.TypeScript, source);
      const root = ast.root();

      const mathPowCalls = root.findAll(mathPowRule);
      if (mathPowCalls.length === 0) {
        break;
      }

      const edits: Edit[] = [];

      for (const node of mathPowCalls) {
        const base = node.getMatch('BASE');
        const exponent = node.getMatch('EXPONENT');
        if (base && exponent) {
          const baseText = base.text();
          const exponentText = exponent.text();
          const edit = node.replace(`(${baseText}) ** (${exponentText})`);
          edits.push(edit);
        }
      }

      const newSource = root.commitEdits(edits);
      if (newSource === source) {
        break;
      }
      source = newSource;
    }

    return source;
  }
};

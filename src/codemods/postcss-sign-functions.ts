import {ts, type Edit} from '@ast-grep/napi';
import type {Options} from '../shared.js';

export function apply(options: Options): string {
  const ast = ts.parse(options.source);
  const root = ast.root();

  const imports = root.findAll({
    rule: {
      any: [
        {
          pattern: {
            context:
              "const $NAME = require('@csstools/postcss-sign-functions')",
            strictness: 'relaxed'
          }
        },
        {
          pattern: {
            context: "import $NAME from '@csstools/postcss-sign-functions'",
            strictness: 'relaxed'
          }
        }
      ]
    }
  });
  const edits: Edit[] = [];

  for (const node of imports) {
    const name = node.getMatch('NAME');
    if (name) {
      const usages = root.findAll({
        rule: {
          pattern: '$NAME($$$_)'
        },
        constraints: {
          NAME: {
            pattern: name.text()
          }
        }
      });
      for (const usage of usages) {
        edits.push(usage.replace(''));
      }
      edits.push(node.replace(''));
    }
  }

  return root.commitEdits(edits);
}

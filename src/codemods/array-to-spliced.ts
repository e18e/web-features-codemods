import {parse, Lang, type Edit, type NapiConfig} from '@ast-grep/napi';
import type {Options, CodeMod} from '../shared.js';
import {getNodesSourceText} from '../typescript-utils.js';

const arrayClonePatterns = [
  {pattern: 'const $NAME = $ARRAY.concat();'},
  {pattern: 'const $NAME = $ARRAY.slice();'},
  {pattern: 'const $NAME = $ARRAY.slice(0);'},
  {pattern: 'const $NAME = [...$ARRAY];'}
];

const arrayToSplicedRule: NapiConfig = {
  rule: {
    all: [
      {
        any: arrayClonePatterns
      },
      {
        precedes: {
          pattern: '$ARRSPLICE.splice($$$ARGS);'
        }
      }
    ]
  }
};

const createSpliceStatementRule = (name: string): NapiConfig => ({
  rule: {
    all: [
      {
        pattern: `${name}.splice($$$ARGS);`
      },
      {
        follows: {
          any: arrayClonePatterns.map((p) => ({
            pattern: p.pattern.replace('$NAME', name)
          }))
        }
      }
    ]
  }
});

export const codemod: CodeMod = {
  test(options: Options): boolean {
    const ast = parse(Lang.TypeScript, options.source);
    const root = ast.root();

    const nodes = root.findAll(arrayToSplicedRule);

    for (const node of nodes) {
      const name = node.getMatch('NAME');
      const arraySplice = node.getMatch('ARRSPLICE');

      if (name && arraySplice && name.text() === arraySplice.text()) {
        return true;
      }
    }

    return false;
  },
  apply(options: Options): string {
    const ast = parse(Lang.TypeScript, options.source);
    const root = ast.root();

    const nodes = root.findAll(arrayToSplicedRule);
    const edits: Edit[] = [];

    for (const node of nodes) {
      const name = node.getMatch('NAME');
      const array = node.getMatch('ARRAY');
      const arraySplice = node.getMatch('ARRSPLICE');

      if (!name || !array || !arraySplice) {
        continue;
      }

      const args = node.getMultipleMatches('ARGS');
      const nameText = name.text();
      const arraySpliceText = arraySplice.text();

      if (nameText !== arraySpliceText) {
        continue;
      }

      const argsText = getNodesSourceText(options.source, args);

      const replaceEdit = node.replace(
        `const ${nameText} = ${array.text()}.toSpliced(${argsText});`
      );
      edits.push(replaceEdit);

      const spliceStatement = root.find(createSpliceStatementRule(nameText));

      if (spliceStatement) {
        const deleteEdit = spliceStatement.replace('');
        edits.push(deleteEdit);
      }
    }

    return root.commitEdits(edits);
  }
};

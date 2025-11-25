import {
  parse,
  Lang,
  type Edit,
  type SgNode,
  type NapiConfig
} from '@ast-grep/napi';
import type {Options, CodeMod} from '../shared.js';

const arrayFromRule: NapiConfig = {
  rule: {
    pattern: 'Array.from({length: $NUM}, () => $VALUE)'
  }
};

const spreadMapRule: NapiConfig = {
  rule: {
    pattern: '[...Array($NUM)].map(() => $VALUE)'
  }
};

const arrayDeclarationRule: NapiConfig = {
  rule: {
    pattern: {
      context: 'const $NAME = new Array($NUM)',
      selector: 'variable_declarator'
    }
  }
};

const emptyArrayDeclarationRule: NapiConfig = {
  rule: {
    pattern: {
      context: 'const $NAME = []',
      selector: 'variable_declarator'
    }
  }
};

function transformArrayFrom(root: SgNode): Edit[] {
  const edits: Edit[] = [];

  const arrayFromNodes = root.findAll(arrayFromRule);

  for (const node of arrayFromNodes) {
    const num = node.getMatch('NUM');
    const value = node.getMatch('VALUE');
    if (num && value) {
      const edit = node.replace(
        `Array.from({length: ${num.text()}}).fill(${value.text()})`
      );
      edits.push(edit);
    }
  }

  return edits;
}

function transformSpreadMap(root: SgNode): Edit[] {
  const edits: Edit[] = [];

  const spreadMapNodes = root.findAll(spreadMapRule);

  for (const node of spreadMapNodes) {
    const num = node.getMatch('NUM');
    const value = node.getMatch('VALUE');
    if (num && value) {
      const edit = node.replace(`Array(${num.text()}).fill(${value.text()})`);
      edits.push(edit);
    }
  }

  return edits;
}

function transformArrayDeclarations(root: SgNode): Edit[] {
  const edits: Edit[] = [];

  const arrayDeclarations = root.findAll(arrayDeclarationRule);

  for (const declNode of arrayDeclarations) {
    const name = declNode.getMatch('NAME');
    const num = declNode.getMatch('NUM');
    if (!name || !num) continue;

    const arrayName = name.text();
    const arraySize = num.text();

    const forLoops = root.findAll({
      rule: {
        pattern: `for (let $INC = 0; $INC < ${arrayName}.length; $INC++) { ${arrayName}[$INC] = $VALUE; }`
      }
    });
    const forLoop = forLoops[0];

    if (forLoops.length !== 1 || !forLoop) {
      continue;
    }

    const inc = forLoop.getMatch('INC');
    const value = forLoop.getMatch('VALUE');
    if (!inc || !value) continue;

    const incName = inc.text();
    const valueText = value.text();
    const arrayNameRegex = new RegExp(`\\b${arrayName}\\b`);
    const incNameRegex = new RegExp(`\\b${incName}\\b`);

    if (arrayNameRegex.test(valueText) || incNameRegex.test(valueText)) {
      break;
    }

    const declEdit = declNode.replace(
      `${arrayName} = new Array(${arraySize}).fill(${valueText})`
    );
    edits.push(declEdit);

    const forLoopEdit = forLoop.replace('');
    edits.push(forLoopEdit);
  }

  return edits;
}

function transformEmptyArrayDeclarations(root: SgNode): Edit[] {
  const edits: Edit[] = [];

  const emptyArrayDeclarations = root.findAll(emptyArrayDeclarationRule);

  for (const declNode of emptyArrayDeclarations) {
    const name = declNode.getMatch('NAME');
    if (!name) continue;

    const arrayName = name.text();

    const forLoops = root.findAll({
      rule: {
        pattern: `for (let $INC = 0; $INC < $NUM; $INC++) { ${arrayName}.push($VALUE); }`
      }
    });
    const forLoop = forLoops[0];

    if (forLoops.length !== 1 || !forLoop) {
      continue;
    }

    const inc = forLoop.getMatch('INC');
    const num = forLoop.getMatch('NUM');
    const value = forLoop.getMatch('VALUE');
    if (!inc || !num || !value) continue;

    const incName = inc.text();
    const valueText = value.text();
    const arrayNameRegex = new RegExp(`\\b${arrayName}\\b`);
    const incNameRegex = new RegExp(`\\b${incName}\\b`);

    if (arrayNameRegex.test(valueText) || incNameRegex.test(valueText)) {
      continue;
    }

    const declEdit = declNode.replace(
      `${arrayName} = Array(${num.text()}).fill(${valueText})`
    );
    edits.push(declEdit);

    const forLoopEdit = forLoop.replace('');
    edits.push(forLoopEdit);
  }

  return edits;
}

export const codemod: CodeMod = {
  test(options: Options): boolean {
    const ast = parse(Lang.TypeScript, options.source);
    const root = ast.root();

    return (
      root.has(arrayFromRule) ||
      root.has(spreadMapRule) ||
      root.has(arrayDeclarationRule) ||
      root.has(emptyArrayDeclarationRule)
    );
  },
  apply(options: Options): string {
    const ast = parse(Lang.TypeScript, options.source);
    const root = ast.root();

    const edits: Edit[] = [
      ...transformArrayFrom(root),
      ...transformSpreadMap(root),
      ...transformArrayDeclarations(root),
      ...transformEmptyArrayDeclarations(root)
    ];

    return root.commitEdits(edits);
  }
};

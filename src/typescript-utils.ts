import type {Edit, SgNode, Rule} from '@ast-grep/napi';

export function getNodesSourceText(source: string, nodes: SgNode[]): string {
  if (nodes.length === 0) {
    return '';
  }
  const firstNode = nodes[0];
  const lastNode = nodes.at(-1);
  if (!firstNode || !lastNode) {
    return '';
  }
  const start = firstNode.range().start;
  const end = lastNode.range().end;
  return source.substring(start.index, end.index);
}

export function removeDefaultImportedSymbol(
  importPath: string,
  root: SgNode,
  edits: Edit[],
  usageRule?: Rule
): void {
  const importPathString = JSON.stringify(importPath);
  const imports = root.findAll({
    rule: {
      any: [
        {
          pattern: {
            context: `const $NAME = require(${importPathString})`,
            strictness: 'relaxed'
          }
        },
        {
          pattern: {
            context: `import $NAME from ${importPathString}`,
            strictness: 'relaxed'
          }
        }
      ]
    }
  });

  for (const node of imports) {
    const name = node.getMatch('NAME');
    if (name) {
      if (usageRule) {
        const usages = root.findAll({
          rule: usageRule,
          constraints: {
            NAME: {
              pattern: name.text()
            }
          }
        });
        for (const usage of usages) {
          edits.push(usage.replace(''));
        }
      }
      edits.push(node.replace(''));
    }
  }
}

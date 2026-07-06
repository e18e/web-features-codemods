import type {Edit, SgNode, Rule, NapiConfig} from '@ast-grep/napi';
import type {Range} from './shared.js';

export function getRangeForNode(node: SgNode): Range {
  const range = node.range();
  return {
    start: {line: range.start.line, column: range.start.column},
    end: {line: range.end.line, column: range.end.column}
  };
}

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

export function createDefaultImportedSymbolRule(
  importPath: string
): NapiConfig {
  const importPathString = JSON.stringify(importPath);
  return {
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
  };
}

export function removeDefaultImportedSymbol(
  importPath: string,
  root: SgNode,
  edits: Edit[],
  usageRule?: Rule
): void {
  const imports = root.findAll(createDefaultImportedSymbolRule(importPath));

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

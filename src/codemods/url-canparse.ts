import {parse, Lang, type Edit, type NapiConfig} from '@ast-grep/napi';
import type {Options, CodeMod, TestResult} from '../shared.js';
import {getNodesSourceText, getRangeForNode} from '../typescript-utils.js';

// Pattern: try { new URL(u); return true; } catch { return false; }
const simpleBooleanReturnPattern: NapiConfig = {
  rule: {
    pattern: `try {
  new URL($URL);
  return true;
} catch {
  return false;
}`
  }
};

// Pattern: try { new URL(u); ...body } catch { ...catchBody }
const tryWithBodyPattern: NapiConfig = {
  rule: {
    pattern: `try {
  new URL($URL);
  $$$BODY
} catch {
  $$$CATCH_BODY
}`
  }
};

export const codemod: CodeMod = {
  test(options: Options): TestResult {
    const ast = parse(Lang.TypeScript, options.source);
    const root = ast.root();

    const node =
      root.find(simpleBooleanReturnPattern) ?? root.find(tryWithBodyPattern);
    return node
      ? {hasMatch: true, range: getRangeForNode(node)}
      : {hasMatch: false};
  },
  apply(options: Options): string {
    const ast = parse(Lang.TypeScript, options.source);
    const root = ast.root();
    const edits: Edit[] = [];
    const processedNodes = new Set<number>();

    const simpleMatches = root.findAll(simpleBooleanReturnPattern);
    for (const node of simpleMatches) {
      const url = node.getMatch('URL');
      if (url) {
        const edit = node.replace(`return URL.canParse(${url.text()})`);
        edits.push(edit);
        processedNodes.add(node.range().start.index);
      }
    }

    const bodyMatches = root.findAll(tryWithBodyPattern);
    for (const node of bodyMatches) {
      if (processedNodes.has(node.range().start.index)) {
        continue;
      }

      const url = node.getMatch('URL');
      const bodyNodes = node.getMultipleMatches('BODY');
      const catchBodyNodes = node.getMultipleMatches('CATCH_BODY');

      if (url && bodyNodes.length > 0) {
        const bodyText = getNodesSourceText(options.source, bodyNodes);
        const catchBodyText =
          catchBodyNodes.length > 0
            ? ` else {\n${getNodesSourceText(options.source, catchBodyNodes)}\n}`
            : '';

        const replacement = `if (URL.canParse(${url.text()})) {\n${bodyText}\n}${catchBodyText}`;
        const edit = node.replace(replacement);
        edits.push(edit);
      }
    }

    return root.commitEdits(edits);
  }
};

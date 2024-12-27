import { processElementAttributes } from './processors/processAttributes';
import { HTMLElement, Node, NodeType } from 'node-html-parser';
import { processTextNode } from './processors/processTextNode';
import { processEach } from './processors/processEach';
import { HtmlLiteral } from './processHtmlLiteral';
import { processIf } from './processors/processIf';
import { TS } from 'ts-plus';

type NodeProcessor = (node: Node, htmlLiteral: HtmlLiteral, expressions: TS.Expression[], f: TS.NodeFactory) => void;

type ElementProcessor = (
  element: HTMLElement,
  htmlLiteral: HtmlLiteral,
  expressions: TS.Expression[],
  f: TS.NodeFactory
) => void;

const processNode: NodeProcessor = (node, htmlLiteral, expressions, f) => {
  if (node instanceof HTMLElement) {
    if (node.tagName === 'EACH') return processEach(node, htmlLiteral, expressions, f);
    if (node.tagName === 'IF') return processIf(node, htmlLiteral, expressions, f);
    if (node.tagName === 'ELSE-IF' || node.tagName === 'ELSE') return;

    processElementAttributes(node, htmlLiteral, expressions, f);

    for (const child of node.childNodes) processNode(child, htmlLiteral, expressions, f);
  }

  if (node.nodeType === NodeType.COMMENT_NODE) return;

  processTextNode(node, htmlLiteral, expressions, f);
};

export { processNode, NodeProcessor, ElementProcessor };

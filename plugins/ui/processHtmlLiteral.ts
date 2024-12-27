import { HTMLElement } from 'node-html-parser';
import { processNode } from './processNode';
import { TS, ts } from 'ts-plus';

interface HtmlLiteral {
  html: HTMLElement;
  markedElements: Set<HTMLElement>;
  instructions: TS.Statement[];
}

function processHtmlLiteral(html: HTMLElement, expressions: TS.Expression[], f: TS.NodeFactory) {
  const htmlLiteral: HtmlLiteral = { html, markedElements: new Set(), instructions: [] };

  for (const node of html.childNodes) processNode(node, htmlLiteral, expressions, f);

  return f.createCallExpression(
    f.createPropertyAccessExpression(f.createIdentifier('$$ui'), f.createIdentifier('view')),
    undefined,
    [
      f.createStringLiteral(html.innerHTML.trim()),
      f.createArrowFunction(
        undefined,
        undefined,
        [
          f.createParameterDeclaration(
            undefined,
            undefined,
            f.createIdentifier('$$root'),
            undefined,
            undefined,
            undefined
          ),
          f.createParameterDeclaration(
            undefined,
            undefined,
            f.createIdentifier('$$els'),
            undefined,
            undefined,
            undefined
          )
        ],
        undefined,
        f.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
        f.createBlock(htmlLiteral.instructions, true)
      )
    ]
  );
}

export { processHtmlLiteral, HtmlLiteral };

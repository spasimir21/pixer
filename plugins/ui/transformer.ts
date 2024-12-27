import { processHtmlLiteral } from './processHtmlLiteral';
import { parse as parseHTML } from 'node-html-parser';
import { TS, ts } from 'ts-plus';

const UI_LIBRARY_LOCATION = '@lib/ui';

function transformSourceFile(
  sourceFile: TS.SourceFile,
  context: TS.TransformationContext,
  f: TS.NodeFactory,
  typeChecker: TS.TypeChecker
) {
  const visitEachChild = (node: TS.Node) => ts.visitEachChild(node, visitor, context);

  let doesFileHaveHtmlLiterals = false;

  const visitor = (node: TS.Node): TS.Node => {
    if (!ts.isTaggedTemplateExpression(node) || !ts.isIdentifier(node.tag) || node.tag.text !== 'html')
      return visitEachChild(node);

    doesFileHaveHtmlLiterals = true;

    const template = node.template;

    const expressions = ts.isNoSubstitutionTemplateLiteral(template)
      ? []
      : (template.templateSpans.map(span => span.expression).map(visitor) as TS.Expression[]);

    const strings = ts.isNoSubstitutionTemplateLiteral(template)
      ? [template.text]
      : [template.head.text, ...template.templateSpans.map(span => span.literal.text)];

    let htmlSource = strings[0];
    for (let i = 1; i < strings.length; i++) {
      htmlSource += `$UI_${i - 1}`;
      htmlSource += strings[i];
    }
    htmlSource = htmlSource.trim();

    const html = parseHTML(htmlSource);

    return processHtmlLiteral(html, expressions, f);
  };

  sourceFile = visitEachChild(sourceFile) as TS.SourceFile;

  if (doesFileHaveHtmlLiterals)
    (sourceFile as any).statements = f.createNodeArray([
      f.createImportDeclaration(
        undefined,
        f.createImportClause(false, undefined, f.createNamespaceImport(f.createIdentifier('$$ui'))),
        f.createStringLiteral(UI_LIBRARY_LOCATION),
        undefined
      ),
      ...sourceFile.statements
    ]);

  return sourceFile;
}

function transformerFactory(program: TS.Program): TS.TransformerFactory<TS.SourceFile> {
  const typeChecker = program.getTypeChecker();

  return context => sourceFile => transformSourceFile(sourceFile, context, context.factory, typeChecker);
}

export { transformerFactory };

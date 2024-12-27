import { TS } from 'ts-plus';

const createInstruction = (f: TS.NodeFactory, instructionName: string, mark: string, ...args: TS.Expression[]) =>
  f.createExpressionStatement(
    f.createCallExpression(
      f.createPropertyAccessExpression(f.createIdentifier('$$ui'), f.createIdentifier(instructionName)),
      undefined,
      [
        f.createIdentifier('$$root'),
        f.createElementAccessExpression(f.createIdentifier('$$els'), f.createNumericLiteral(mark)),
        ...args
      ]
    )
  );

export { createInstruction };

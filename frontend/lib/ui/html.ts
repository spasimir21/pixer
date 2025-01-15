import { UINode } from './UINode';

const html = (_strings: TemplateStringsArray, ..._args: any[]): UINode => {
  throw new Error(
    `The 'html' tagged template literal is only a compiler macro and should not be called during runtime operations! Please check your bundler/compiler and verify that the correct code transformers are installed and working properly!`
  );
};

export { html };

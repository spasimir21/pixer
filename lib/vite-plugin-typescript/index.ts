import typescript from 'typescript';
import { Plugin } from 'vite';
import fs from 'fs';

export default function viteTypescript(rootFileNames: string[], ts: typeof typescript): Plugin {
  const fileVersions = new Map<string, number>();

  const servicesHost: typescript.LanguageServiceHost = {
    getScriptFileNames: () => rootFileNames,
    getScriptVersion: fileName => (fileVersions.get(fileName) ?? 0).toString(),
    getScriptSnapshot: fileName => {
      if (!fs.existsSync(fileName)) {
        return undefined;
      }

      return ts.ScriptSnapshot.fromString(fs.readFileSync(fileName).toString());
    },
    getCurrentDirectory: () => process.cwd(),
    getCompilationSettings: () =>
      ts.convertCompilerOptionsFromJson(
        ts.readConfigFile('./tsconfig.json', ts.sys.readFile).config.compilerOptions,
        process.cwd()
      ).options,
    getDefaultLibFileName: options => ts.getDefaultLibFilePath(options),
    fileExists: ts.sys.fileExists,
    readFile: ts.sys.readFile,
    readDirectory: ts.sys.readDirectory,
    directoryExists: ts.sys.directoryExists,
    getDirectories: ts.sys.getDirectories
  };

  const services = ts.createLanguageService(servicesHost, ts.createDocumentRegistry());

  return {
    name: 'typescript-transform',
    apply: () => true,
    enforce: 'pre',
    transform(_, filename) {
      if (!filename.endsWith('.ts')) return null;

      const currentVersion = fileVersions.get(filename) ?? -1;
      fileVersions.set(filename, currentVersion + 1);

      let output = services.getEmitOutput(filename);

      const targetMapFilename = filename.replace('.ts', '.js.map');
      const targetFilename = filename.replace('.ts', '.js');

      const emitted = output.outputFiles.find(file => file.name === targetFilename)?.text;
      const map = output.outputFiles.find(file => file.name === targetMapFilename)?.text;

      if (emitted == null) return null;

      return {
        code: emitted,
        map
      };
    }
  };
}

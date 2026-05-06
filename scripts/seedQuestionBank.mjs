import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const scriptFile = path.join(__dirname, "seedQuestionBank.ts");
const source = fs.readFileSync(scriptFile, "utf8");

const compiled = ts.transpileModule(source, {
  compilerOptions: {
    esModuleInterop: true,
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
  },
  fileName: scriptFile,
}).outputText;

const cjsModule = { exports: {} };
const sandbox = {
  Buffer,
  __dirname,
  __filename: scriptFile,
  clearInterval,
  clearTimeout,
  console,
  exports: cjsModule.exports,
  module: cjsModule,
  process,
  require,
  setInterval,
  setTimeout,
};

vm.runInNewContext(compiled, sandbox, { filename: scriptFile });

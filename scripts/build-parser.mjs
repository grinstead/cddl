import fs from "node:fs/promises";
import path from "node:path";
import peggy from "peggy";

const root = process.cwd();
const grammarPath = path.join(root, "src", "grammar", "cddl.peggy");
const outputPath = path.join(root, "src", "generated", "cddl-parser.ts");

const grammar = await fs.readFile(grammarPath, "utf8");
const source = peggy.generate(grammar, {
  output: "source",
  format: "es",
  allowedStartRules: ["cddl"]
});

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(
  outputPath,
  `// @ts-nocheck\n/* Auto-generated from src/grammar/cddl.peggy. Do not edit by hand. */\n${source}\n`,
  "utf8"
);

console.log(`Generated parser: ${path.relative(root, outputPath)}`);

import path from "node:path";
import { spawn } from "node:child_process";

const root = process.cwd();
const grammarPath = path.join(root, "src", "grammar", "cddl.peggy");
const outputPath = path.join(root, "src", "generated", "cddl-parser.js");
const peggyBin = path.join(
  root,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "peggy.cmd" : "peggy"
);

await new Promise((resolve, reject) => {
  const child = spawn(
    peggyBin,
    [
      "--format",
      "es",
      "--allowed-start-rules",
      "cddl",
      "--trace",
      "--return-types",
      "{\"cddl\":\"unknown\"}",
      "--dts",
      "--output",
      outputPath,
      grammarPath
    ],
    { stdio: "inherit" }
  );

  child.on("error", reject);
  child.on("exit", (code) => {
    if (code === 0) {
      resolve();
      return;
    }
    reject(new Error(`peggy failed with exit code ${code ?? "unknown"}`));
  });
});

console.log(`Generated parser: ${path.relative(root, outputPath)}`);

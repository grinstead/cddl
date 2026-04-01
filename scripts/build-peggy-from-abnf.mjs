import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

const root = process.cwd();
const input = path.join(root, "src", "grammar", "cddl.abnf");
const output = path.join(root, "src", "grammar", "cddl.peggy");

const abnfGenBin = path.join(
  root,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "abnf_gen.cmd" : "abnf_gen"
);

await fs.mkdir(path.dirname(output), { recursive: true });

await new Promise((resolve, reject) => {
  const child = spawn(abnfGenBin, ["-f", "peggy", "-s", "cddl", "-o", output, input], {
    stdio: "inherit"
  });

  child.on("error", reject);
  child.on("exit", (code) => {
    if (code === 0) {
      resolve();
      return;
    }
    reject(new Error(`abnf_gen failed with exit code ${code ?? "unknown"}`));
  });
});

const generated = await fs.readFile(output, "utf8");
const header = [
  "// Auto-generated from src/grammar/cddl.abnf via npm abnf.",
  "// Source ABNF: RFC 8610 Appendix B",
  "// https://datatracker.ietf.org/doc/html/rfc8610#appendix-B",
  ""
].join("\n");
await fs.writeFile(output, header + generated, "utf8");

console.log(`Generated Peggy grammar: ${path.relative(root, output)}`);

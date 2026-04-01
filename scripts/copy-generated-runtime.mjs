import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const files = ["cddl-parser.js", "cddl-parser.d.ts"];

for (const file of files) {
  const source = path.join(root, "src", "generated", file);
  const target = path.join(root, "dist", "generated", file);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.copyFile(source, target);
}

console.log("Copied generated parser runtime files to dist/generated");

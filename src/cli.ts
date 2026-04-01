#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { parseCddl, CddlParseError } from "./parser.js";

function usage(): string {
  return [
    "Usage:",
    "  cddl <file.cddl>",
    "",
    "Validates CDDL syntax using an RFC 8610 Appendix B-based grammar."
  ].join("\n");
}

async function main(): Promise<void> {
  const [, , ...args] = process.argv;
  const [file] = args;

  if (!file || file === "-h" || file === "--help") {
    console.log(usage());
    process.exit(file ? 0 : 1);
  }

  const absolutePath = path.resolve(process.cwd(), file);
  const input = await fs.readFile(absolutePath, "utf8");

  try {
    parseCddl(input);
    console.log(`valid CDDL: ${file}`);
  } catch (error) {
    if (error instanceof CddlParseError && error.line && error.column) {
      console.error(`invalid CDDL: ${file}:${error.line}:${error.column}`);
      console.error(error.message);
      process.exit(2);
    }

    if (error instanceof Error) {
      console.error(`invalid CDDL: ${file}`);
      console.error(error.message);
      process.exit(2);
    }

    console.error(`invalid CDDL: ${file}`);
    process.exit(2);
  }
}

main().catch((error: unknown) => {
  if (error instanceof Error) {
    console.error(error.message);
    process.exit(1);
  }
  console.error("Unexpected error");
  process.exit(1);
});

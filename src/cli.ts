#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { parseCddl } from "./parser.js";

async function validateFile(
  file: string,
): Promise<{ status: "fulfilled" } | { status: "rejected"; reason: string }> {
  const absolutePath = path.resolve(process.cwd(), file);
  const input = await fs.readFile(absolutePath, "utf8");

  const result = parseCddl(input, { source: file });

  if (result.status === "fulfilled") return result;

  return {
    status: "rejected",
    reason: result.reason.format([{ source: file, text: input }]),
  };
}

function printUsage(): void {
  console.log(
    `
Usage:
  cddl validate <filenames...>

Commands:
  validate   Validate one or more CDDL files.
`.trim(),
  );
}

async function main(): Promise<void> {
  const [, , command, ...args] = process.argv;

  if (!command || command === "-h" || command === "--help") {
    printUsage();
    process.exit(command ? 0 : 1);
  }

  if (command !== "validate") {
    console.error(`Unknown command: ${command}`);
    printUsage();
    process.exit(1);
  }

  if (args.length === 0) {
    console.error("No input files provided.");
    printUsage();
    process.exit(1);
  }

  let allValid = true;
  for (const file of args) {
    const result = await validateFile(file);

    if (result.status === "rejected") {
      let { reason } = result;

      if (!allValid) reason = `\n${reason}`;
      console.error(reason);

      allValid = false;
    }
  }

  process.exit(allValid ? 0 : 2);
}

main().catch((error: unknown) => {
  if (error instanceof Error) {
    console.error(error.message);
    process.exit(1);
  }
  console.error("Unexpected error");
  process.exit(1);
});

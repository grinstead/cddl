#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { parseCddl, CddlParseError } from "./parser.js";

async function validateFile(file: string): Promise<boolean> {
  const absolutePath = path.resolve(process.cwd(), file);
  const input = await fs.readFile(absolutePath, "utf8");

  try {
    parseCddl(input);
    console.log(`valid CDDL: ${file}`);
    return true;
  } catch (error) {
    if (error instanceof CddlParseError && error.line && error.column) {
      console.error(`invalid CDDL: ${file}:${error.line}:${error.column}`);
      console.error(error.message);
      return false;
    }

    if (error instanceof Error) {
      console.error(`invalid CDDL: ${file}`);
      console.error(error.message);
      return false;
    }

    console.error(`invalid CDDL: ${file}`);
    return false;
  }
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
    const valid = await validateFile(file);
    allValid = allValid && valid;
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

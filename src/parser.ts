import { parse as parseWithPeggy } from "./generated/cddl-parser.js";

export class CddlParseError extends Error {
  readonly line?: number;
  readonly column?: number;
  readonly offset?: number;

  constructor(message: string, line?: number, column?: number, offset?: number) {
    super(message);
    this.name = "CddlParseError";
    this.line = line;
    this.column = column;
    this.offset = offset;
  }
}

export function parseCddl(input: string): unknown {
  try {
    return parseWithPeggy(input, {});
  } catch (error) {
    const maybePeggy = error as {
      message?: string;
      location?: { start?: { line?: number; column?: number; offset?: number } };
    };

    throw new CddlParseError(
      maybePeggy.message ?? "Invalid CDDL input.",
      maybePeggy.location?.start?.line,
      maybePeggy.location?.start?.column,
      maybePeggy.location?.start?.offset
    );
  }
}

export function validateCddl(input: string): { ok: true } {
  parseCddl(input);
  return { ok: true };
}

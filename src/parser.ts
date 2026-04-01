import {
  parse as parseWithPeggy,
  SyntaxError as PeggySyntaxError,
  type SourceText
} from "./generated/cddl-parser.js";

export class CddlParseError extends Error {
  readonly line?: number;
  readonly column?: number;
  readonly offset?: number;
  readonly formattedMessage?: string;

  constructor(
    message: string,
    line?: number,
    column?: number,
    offset?: number,
    formattedMessage?: string
  ) {
    super(message);
    this.name = "CddlParseError";
    this.line = line;
    this.column = column;
    this.offset = offset;
    this.formattedMessage = formattedMessage;
  }
}

export type ParseCddlOptions = {
  source?: string;
};

export function parseCddl(input: string, options: ParseCddlOptions = {}): unknown {
  try {
    return parseWithPeggy(input, { grammarSource: options.source ?? "input.cddl" });
  } catch (error) {
    if (!(error instanceof PeggySyntaxError)) {
      throw error;
    }

    const sources: SourceText[] = [{ source: options.source ?? "input.cddl", text: input }];
    const formattedMessage =
      typeof error.format === "function" ? error.format(sources) : undefined;

    throw new CddlParseError(
      error.message ?? "Invalid CDDL input.",
      error.location?.start?.line,
      error.location?.start?.column,
      error.location?.start?.offset,
      formattedMessage
    );
  }
}

export function validateCddl(input: string, options: ParseCddlOptions = {}): { ok: true } {
  parseCddl(input, options);
  return { ok: true };
}

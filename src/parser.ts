import {
  parse as parseWithPeggy,
  SyntaxError as PeggySyntaxError,
} from "./generated/cddl-parser.js";

export type ParseCddlOptions = {
  source?: string;
};

export type ParseCddlResult =
  | { status: "fulfilled" }
  | { status: "rejected"; reason: PeggySyntaxError };

export function parseCddl(
  input: string,
  options: ParseCddlOptions = {},
): ParseCddlResult {
  try {
    parseWithPeggy(
      input,
      options.source ? { grammarSource: options.source } : undefined,
    );
    return { status: "fulfilled" };
  } catch (error) {
    if (error instanceof PeggySyntaxError) {
      return { status: "rejected", reason: error };
    }

    throw error;
  }
}

export { PeggySyntaxError };

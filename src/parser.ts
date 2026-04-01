import {
  type LocationRange,
  type ParserTracer,
  parse as parseWithPeggy,
  SyntaxError as PeggySyntaxError,
} from "./generated/cddl-parser.js";

export type ParseCddlOptions = {
  source?: string;
};

export type ParseCddlResult =
  | { status: "fulfilled" }
  | { status: "rejected"; reason: PeggySyntaxError };

type ValidationIssue = {
  message: string;
  offset: number;
};

function offsetToLocation(
  input: string,
  offset: number,
): { line: number; column: number; offset: number } {
  let line = 1;
  let column = 1;
  let i = 0;

  while (i < offset && i < input.length) {
    const ch = input[i];
    if (ch === "\r") {
      if (input[i + 1] === "\n") {
        i += 1;
      }
      line += 1;
      column = 1;
    } else if (ch === "\n") {
      line += 1;
      column = 1;
    } else {
      column += 1;
    }
    i += 1;
  }

  return { line, column, offset };
}

function makeSyntaxError(
  message: string,
  source: string,
  input: string,
  offset: number,
): PeggySyntaxError {
  const start = offsetToLocation(input, offset);
  const end = offsetToLocation(input, Math.min(offset + 1, input.length));
  return new PeggySyntaxError(message, [], null, {
    source,
    start,
    end,
  });
}

function nextLineOffset(input: string, start: number): number {
  let i = start;
  while (i < input.length) {
    const ch = input[i];
    if (ch === "\r") {
      return input.startsWith("\r\n", i) ? i + 2 : i + 1;
    }
    if (ch === "\n") {
      return i + 1;
    }
    i += 1;
  }
  return i;
}

function validateHexBody(
  body: string,
  bodyOffset: number,
): ValidationIssue | null {
  let hexCount = 0;
  let i = 0;

  while (i < body.length) {
    const ch = body[i];
    if (ch === ";") {
      i = nextLineOffset(body, i);
      continue;
    }
    if (/\s/.test(ch)) {
      i += 1;
      continue;
    }
    if (/^[0-9A-Fa-f]$/.test(ch)) {
      hexCount += 1;
      i += 1;
      continue;
    }
    return {
      message:
        "Invalid character in h'...' byte string. Expected hexadecimal digits and whitespace/comments only.",
      offset: bodyOffset + i,
    };
  }

  if (hexCount % 2 !== 0) {
    return {
      message: "Invalid h'...' byte string. Hex digit count must be even.",
      offset: bodyOffset,
    };
  }

  return null;
}

function validateBase64Body(
  body: string,
  bodyOffset: number,
): ValidationIssue | null {
  const chars: string[] = [];
  const offsets: number[] = [];
  let i = 0;

  while (i < body.length) {
    const ch = body[i];
    if (ch === ";") {
      i = nextLineOffset(body, i);
      continue;
    }
    if (/\s/.test(ch)) {
      i += 1;
      continue;
    }
    if (/^[A-Za-z0-9+/=_-]$/.test(ch)) {
      chars.push(ch);
      offsets.push(bodyOffset + i);
      i += 1;
      continue;
    }
    return {
      message:
        "Invalid character in b64'...' byte string. Expected base64/base64url characters and whitespace/comments only.",
      offset: bodyOffset + i,
    };
  }

  const value = chars.join("");
  if (value.length === 0) {
    return null;
  }

  const hasPadding = value.includes("=");
  const standardPadded =
    /^[A-Za-z0-9+/]*={0,2}$/.test(value) && value.length % 4 === 0;
  const urlPadded =
    /^[A-Za-z0-9_-]*={0,2}$/.test(value) && value.length % 4 === 0;
  const standardUnpadded =
    /^[A-Za-z0-9+/]+$/.test(value) && value.length % 4 !== 1;
  const urlUnpadded = /^[A-Za-z0-9_-]+$/.test(value) && value.length % 4 !== 1;

  const valid = hasPadding
    ? standardPadded || urlPadded
    : standardUnpadded || urlUnpadded;
  if (!valid) {
    return {
      message:
        "Invalid b64'...' byte string. Content must be valid base64 or base64url after removing whitespace/comments.",
      offset: offsets[0] ?? bodyOffset,
    };
  }

  return null;
}

function validatePrefixedByteRange(
  input: string,
  range: LocationRange,
): ValidationIssue | null {
  const startOffset = range.start.offset;
  const endOffset = range.end.offset;
  const raw = input.slice(startOffset, endOffset);

  if (raw.startsWith("h'") && raw.endsWith("'")) {
    const bodyOffset = startOffset + 2;
    const body = raw.slice(2, -1);
    return validateHexBody(body, bodyOffset);
  }

  if (raw.startsWith("b64'") && raw.endsWith("'")) {
    const bodyOffset = startOffset + 4;
    const body = raw.slice(4, -1);
    return validateBase64Body(body, bodyOffset);
  }

  // should not happen
  return null;
}

export function parseCddl(
  input: string,
  options: ParseCddlOptions = {},
): ParseCddlResult {
  try {
    const { source = "unnamed_source" } = options;

    // the abnf does not fully check the byte formats, so we have to check them
    // after the fact
    const byteRanges: LocationRange[] = [];

    // parse
    parseWithPeggy(input, {
      grammarSource: source,
      tracer: {
        trace(event) {
          if (event.type === "rule.match" && event.rule === "bytes") {
            byteRanges.push(event.location);
          }
        },
      },
    });

    // manually check declared byte string
    for (const range of byteRanges) {
      const issue = validatePrefixedByteRange(input, range);
      if (issue) {
        return {
          status: "rejected",
          reason: makeSyntaxError(issue.message, source, input, issue.offset),
        };
      }
    }

    return { status: "fulfilled" };
  } catch (error) {
    if (error instanceof PeggySyntaxError) {
      return { status: "rejected", reason: error };
    }

    throw error;
  }
}

export { PeggySyntaxError };

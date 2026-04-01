# `@grinstead/cddl`

Validate CDDL files from the command line and in Node.js.

The parser is based on the RFC 8610 Appendix B grammar.
Source-of-truth is ABNF in `src/grammar/cddl.abnf`, which is converted
to Peggy in build steps.

## CLI

```bash
npx @grinstead/cddl validate schema.cddl
```

On success:

```text
valid CDDL: schema.cddl
```

On failure, output includes line and column when available.

You can validate multiple files in one call:

```bash
npx @grinstead/cddl validate a.cddl b.cddl
```

## Library

```ts
import { parseCddl, validateCddl } from "@grinstead/cddl";

parseCddl("person = { age: int }");
validateCddl("person = { age: int }");
```

## Development

```bash
npm install
npm test
```

Parser generation:

```bash
npm run generate:peggy
npm run generate:parser
```


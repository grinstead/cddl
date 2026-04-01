# `@grinstead/cddl`

Validate CDDL files from the command line and in Node.js.

The parser is based on the RFC 8610 Appendix B grammar.

## CLI

```bash
npx @grinstead/cddl schema.cddl
```

On success:

```text
valid CDDL: schema.cddl
```

On failure, output includes line and column when available.

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
npm run generate:parser
```


import test from "node:test";
import assert from "node:assert/strict";
import { parseCddl } from "../parser.js";

test("parses a basic valid CDDL document", () => {
  const input = `
person = {
  age: int,
  name: tstr,
}
`;

  assert.doesNotThrow(() => parseCddl(input));
});

test("rejects clearly invalid CDDL", () => {
  const input = `
person = {
  age:,
}
`;

  assert.throws(() => parseCddl(input));
});

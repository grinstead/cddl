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

  const result = parseCddl(input);
  assert.equal(result.status, "fulfilled");
});

test("rejects clearly invalid CDDL", () => {
  const input = `
person = {
  age:,
}
`;

  const result = parseCddl(input);
  assert.equal(result.status, "rejected");
});

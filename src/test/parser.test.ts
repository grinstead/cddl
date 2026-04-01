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

test("rejects invalid hexadecimal prefixed byte strings", () => {
  const input = `
v = h'0'
`;

  const result = parseCddl(input);
  assert.equal(result.status, "rejected");
});

test("accepts valid prefixed byte strings", () => {
  const input = `
a = h'0a ff'
b = b64'Zm9v'
`;

  const result = parseCddl(input);
  assert.equal(result.status, "fulfilled");
});

test("accepts valid base64 padding variants", () => {
  const input = `
a = b64'Zg=='
b = b64'Zm8='
c = b64'Zm9v'
d = b64'Zm9vYg=='
`;

  const result = parseCddl(input);
  assert.equal(result.status, "fulfilled");
});

test("rejects invalid base64 padding placement", () => {
  const input = `
a = b64'Zm=8'
`;

  const result = parseCddl(input);
  assert.equal(result.status, "rejected");
});

test("rejects invalid unpadded base64 length", () => {
  const input = `
a = b64'Z'
`;

  const result = parseCddl(input);
  assert.equal(result.status, "rejected");
});

test("rejects mixed base64 and base64url alphabets", () => {
  const input = `
a = b64'ab+c_'
`;

  const result = parseCddl(input);
  assert.equal(result.status, "rejected");
});

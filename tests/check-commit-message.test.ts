import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { execPath } from "node:process";
import { createTestDirectory } from "./test-utils";

const longHeader = `fix: ${"x".repeat(116)}`;
const cases = [
  { name: "plain header", message: "fix: handle missing modules", status: 0 },
  { name: "scoped header", message: "chore(deps): replace formatter", status: 0 },
  { name: "breaking header", message: "feat(loader)!: change resolution", status: 0 },
  { name: "message body", message: "docs: explain setup\n\nAdditional detail.", status: 0 },
  { name: "merge header", message: "Merge branch 'main'", status: 0 },
  { name: "missing type", message: "replace formatter", status: 1 },
  { name: "missing subject", message: "fix: ", status: 1 },
  { name: "unknown type", message: "unknown: replace formatter", status: 1 },
  { name: "long header", message: longHeader, status: 1 },
];

cases.forEach(({ name, message, status }) => {
  test(`commit message: ${name}`, async (t) => {
    const directory = await createTestDirectory(t);
    const messagePath = join(directory, "COMMIT_EDITMSG");
    await writeFile(messagePath, message);
    const result = spawnSync(execPath, ["scripts/check-commit-message.js", messagePath], { encoding: "utf8" });
    assert.equal(result.status, status, result.stderr);
  });
});

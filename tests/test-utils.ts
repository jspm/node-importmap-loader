import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { TestContext } from "node:test";

export const createTestDirectory = async (t: TestContext): Promise<string> => {
  const directory = await mkdtemp(join(tmpdir(), "node-importmap-loader-test-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  return directory;
};

import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { access, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { parseNodeModuleCachePath } from "../src/parser";
import { createTestDirectory } from "./test-utils";

describe("parser", () => {
  test("downloads a module into the cache", async (t) => {
    const directory = await createTestDirectory(t);
    const cachePath = join(directory, "nested", "module.js");
    t.mock.method(globalThis, "fetch", async () => new Response("export default 42;"));
    assert.equal(await parseNodeModuleCachePath("https://example.com/module.js", cachePath), cachePath);
    assert.equal(await readFile(cachePath, "utf8"), "export default 42;");
  });

  test("reuses an existing cache file", async (t) => {
    const directory = await createTestDirectory(t);
    const cachePath = join(directory, "module.js");
    await writeFile(cachePath, "cached");
    const fetchModule = t.mock.method(globalThis, "fetch", async () => new Response("unexpected"));
    assert.equal(await parseNodeModuleCachePath("https://example.com/module.js", cachePath), cachePath);
    assert.equal(fetchModule.mock.callCount(), 0);
  });

  test("does not write failed downloads", async (t) => {
    const directory = await createTestDirectory(t);
    const cachePath = join(directory, "missing.js");
    t.mock.method(console, "error", () => {});
    t.mock.method(globalThis, "fetch", async () => new Response(null, { status: 404 }));
    assert.equal(await parseNodeModuleCachePath("https://example.com/missing.js", cachePath), cachePath);
    await assert.rejects(access(cachePath), { code: "ENOENT" });
  });
});

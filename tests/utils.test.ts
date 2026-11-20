import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { access, readFile, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { importmap } from "../src/config";
import {
  checkIfNodeOrFileProtocol,
  ensureDirSync,
  ensureFileSync,
  resolveModulePath,
  resolveNodeModuleCachePath,
  resolveParsedModulePath,
} from "../src/utils";
import { createTestDirectory } from "./test-utils";

describe("utils - protocols", () => {
  test("recognizes Node and file URLs", () => {
    assert.equal(checkIfNodeOrFileProtocol("node:fs"), true);
    assert.equal(checkIfNodeOrFileProtocol("file:///path/to/file.js"), true);
    assert.equal(checkIfNodeOrFileProtocol("https://example.com/module.js"), false);
    assert.equal(checkIfNodeOrFileProtocol("http://example.com/module.js"), false);
  });
});

describe("utils - file operations", () => {
  test("creates nested directories and tolerates existing ones", async (t) => {
    const directory = await createTestDirectory(t);
    const nested = join(directory, "parent", "child");
    ensureDirSync(nested);
    ensureDirSync(nested);
    assert.equal((await stat(nested)).isDirectory(), true);
  });

  test("creates a file and its parent directories", async (t) => {
    const directory = await createTestDirectory(t);
    const file = join(directory, "parent", "module.js");
    ensureFileSync(file);
    assert.equal(await readFile(file, "utf8"), "");
  });

  test("preserves an existing file", async (t) => {
    const directory = await createTestDirectory(t);
    const file = join(directory, "module.js");
    await writeFile(file, "existing");
    t.mock.method(console, "error", () => {});
    ensureFileSync(file);
    assert.equal(await readFile(file, "utf8"), "existing");
  });

  test("reports directory creation failures", async (t) => {
    const directory = await createTestDirectory(t);
    const file = join(directory, "file");
    await writeFile(file, "existing");
    t.mock.method(console, "error", () => {});
    assert.throws(() => ensureDirSync(join(file, "child")), { code: "ENOTDIR" });
  });
});

describe("utils - module resolution", () => {
  test("resolves a specifier with the configured import map", (t) => {
    const resolve = t.mock.method(importmap, "resolve", () => "https://example.com/module.js");
    assert.equal(resolveModulePath("module", "file:///project/index.js"), "https://example.com/module.js");
    assert.deepEqual(resolve.mock.calls[0].arguments, ["module", "file:///project/index.js"]);
  });

  test("returns null when the import map cannot resolve a module", (t) => {
    t.mock.method(importmap, "resolve", () => {
      throw new Error("Module not found");
    });
    assert.equal(resolveModulePath("missing", "file:///project/index.js"), null);
  });

  test("derives cache paths from module metadata", async () => {
    const result = await resolveNodeModuleCachePath("https://ga.jspm.io/npm:lodash@4.17.21/index.js");
    assert.ok(result?.endsWith(join("lodash@4.17.21", "index.js")));
  });

  test("downloads parsed modules into the requested cache path", async (t) => {
    const directory = await createTestDirectory(t);
    const file = join(directory, "module.js");
    t.mock.method(globalThis, "fetch", async () => new Response("export default 42;"));
    assert.equal(await resolveParsedModulePath("https://example.com/module.js", file), file);
    assert.equal(await readFile(file, "utf8"), "export default 42;");
  });

  test("does not cache failed module downloads", async (t) => {
    const directory = await createTestDirectory(t);
    const file = join(directory, "module.js");
    t.mock.method(console, "error", () => {});
    t.mock.method(globalThis, "fetch", async () => {
      throw new Error("Network error");
    });
    assert.equal(await resolveParsedModulePath("https://example.com/module.js", file), file);
    await assert.rejects(access(file), { code: "ENOENT" });
  });
});

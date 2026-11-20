import { describe, test } from "node:test";
import assert from "node:assert";
import { resolve } from "../src/loader";

describe("loader fallback", () => {
  test("resolved with basic config", async (t) => {
    const nextResolve = t.mock.fn(async (_specifier: string) => ({ url: "resolved-url" }));
    const specifier = "specifier";
    const context = { parentURL: "parentURL" };

    await resolve(specifier, context, nextResolve);

    assert.strictEqual(nextResolve.mock.callCount(), 1);
    assert.strictEqual(nextResolve.mock.calls[0].arguments[0], "specifier");
  });

  test("returns nextResolve when no parentURL", async (t) => {
    const nextResolve = t.mock.fn(async (_specifier: string) => ({ url: "resolved-url" }));
    const specifier = "test-module";
    const context = {};

    await resolve(specifier, context, nextResolve);

    assert.strictEqual(nextResolve.mock.callCount(), 1);
    assert.strictEqual(nextResolve.mock.calls[0].arguments[0], "test-module");
  });

  test("returns nextResolve when parentURL is undefined", async (t) => {
    const nextResolve = t.mock.fn(async (_specifier: string) => ({ url: "resolved-url" }));
    const specifier = "test-module";
    const context = { parentURL: undefined };

    await resolve(specifier, context, nextResolve);

    assert.strictEqual(nextResolve.mock.callCount(), 1);
    assert.strictEqual(nextResolve.mock.calls[0].arguments[0], "test-module");
  });
});

describe("loader path specifiers", () => {
  test("handles node: protocol specifiers", async (t) => {
    const nextResolve = t.mock.fn(async (_specifier: string) => ({ url: "node:fs" }));
    const specifier = "node:fs";
    const context = { parentURL: "file:///project/index.js" };

    await resolve(specifier, context, nextResolve);

    assert.strictEqual(nextResolve.mock.callCount(), 1);
    assert.strictEqual(nextResolve.mock.calls[0].arguments[0], "node:fs");
  });

  test("handles file: protocol specifiers", async (t) => {
    const nextResolve = t.mock.fn(async (_specifier: string) => ({ url: "file:///path/to/file.js" }));
    const specifier = "file:///path/to/file.js";
    const context = { parentURL: "file:///project/index.js" };

    await resolve(specifier, context, nextResolve);

    assert.strictEqual(nextResolve.mock.callCount(), 1);
    assert.strictEqual(nextResolve.mock.calls[0].arguments[0], "file:///path/to/file.js");
  });

  test("handles relative path specifiers", async (t) => {
    const nextResolve = t.mock.fn(async (_specifier: string) => ({ url: "file:///project/module.js" }));
    const specifier = "./module.js";
    const context = { parentURL: "file:///project/index.js" };

    await resolve(specifier, context, nextResolve);

    assert.strictEqual(nextResolve.mock.callCount(), 1);
    assert.strictEqual(nextResolve.mock.calls[0].arguments[0], "./module.js");
  });
});

describe("loader package specifiers", () => {
  test("handles npm package specifiers", async (t) => {
    const nextResolve = t.mock.fn(async () => ({ url: "resolved-package" }));
    const specifier = "lodash";
    const context = { parentURL: "file:///project/index.js" };

    await resolve(specifier, context, nextResolve);

    assert.strictEqual(nextResolve.mock.callCount(), 1);
  });

  test("handles scoped npm packages", async (t) => {
    const nextResolve = t.mock.fn(async () => ({ url: "resolved-package" }));
    const specifier = "@babel/core";
    const context = { parentURL: "file:///project/index.js" };

    await resolve(specifier, context, nextResolve);

    assert.strictEqual(nextResolve.mock.callCount(), 1);
  });

  test("handles deep imports from packages", async (t) => {
    const nextResolve = t.mock.fn(async () => ({ url: "resolved-package" }));
    const specifier = "lodash/debounce";
    const context = { parentURL: "file:///project/index.js" };

    await resolve(specifier, context, nextResolve);

    assert.strictEqual(nextResolve.mock.callCount(), 1);
  });
});

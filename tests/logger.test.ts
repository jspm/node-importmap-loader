import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { logger } from "../src/logger";

describe("logger", () => {
  test("logs debug messages only when enabled", (t) => {
    const debug = t.mock.method(console, "debug", () => {});
    logger({ file: "test", isLogging: false }).debug("hidden");
    assert.equal(debug.mock.callCount(), 0);
    logger({ file: "test", isLogging: true }).debug("visible");
    assert.deepEqual(debug.mock.calls[0].arguments, ["jspm:[test]: visible"]);
  });

  test("logs errors regardless of the debug setting", (t) => {
    const error = t.mock.method(console, "error", () => {});
    logger({ file: "test", isLogging: false }).error("critical error");
    logger({ file: "test", isLogging: true }).error("another error");
    assert.deepEqual(
      error.mock.calls.map((call) => call.arguments),
      [["jspm:[test]: critical error"], ["jspm:[test]: another error"]],
    );
  });

  test("preserves additional arguments", (t) => {
    const debug = t.mock.method(console, "debug", () => {});
    const error = t.mock.method(console, "error", () => {});
    const log = logger({ file: "test", isLogging: true });
    const data = { value: 123 };
    const failure = new Error("test error");
    log.debug("message", data, 123);
    log.error("error occurred", failure);
    assert.deepEqual(debug.mock.calls[0].arguments, ["jspm:[test]: message", data, 123]);
    assert.deepEqual(error.mock.calls[0].arguments, ["jspm:[test]: error occurred", failure]);
  });

  test("uses each logger's file prefix", (t) => {
    const debug = t.mock.method(console, "debug", () => {});
    logger({ file: "loader", isLogging: true }).debug("message");
    logger({ file: "parser", isLogging: true }).debug("message");
    assert.deepEqual(
      debug.mock.calls.map((call) => call.arguments),
      [["jspm:[loader]: message"], ["jspm:[parser]: message"]],
    );
  });

  test("formats empty strings, null, and undefined", (t) => {
    const debug = t.mock.method(console, "debug", () => {});
    const log = logger({ file: "test", isLogging: true });
    log.debug("");
    log.debug(null as unknown as string);
    log.debug(undefined as unknown as string);
    assert.deepEqual(
      debug.mock.calls.map((call) => call.arguments),
      [["jspm:[test]: "], ["jspm:[test]: null"], ["jspm:[test]: undefined"]],
    );
  });

  test("preserves objects and arrays", (t) => {
    const debug = t.mock.method(console, "debug", () => {});
    const log = logger({ file: "test", isLogging: true });
    const object = { key: "value" };
    const array = [1, 2, 3];
    log.debug("object:", object);
    log.debug("array:", array);
    assert.deepEqual(
      debug.mock.calls.map((call) => call.arguments),
      [
        ["jspm:[test]: object:", object],
        ["jspm:[test]: array:", array],
      ],
    );
  });
});

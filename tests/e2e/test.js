import { test } from "node:test";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { execPath } from "node:process";

const execFileAsync = promisify(execFile);

test("loads React and router modules through the import map", async () => {
  await execFileAsync(execPath, ["--loader", "./dist/loader.js", "tests/fixtures/importmap-modules.js"]);
});

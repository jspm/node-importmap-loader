import { test } from "node:test";
import assert from "node:assert/strict";
import { execFile, spawn } from "node:child_process";
import { once } from "node:events";
import { createInterface } from "node:readline";
import { promisify } from "node:util";
import { execPath } from "node:process";

const execFileAsync = promisify(execFile);

test("loads React and router modules through the import map", async () => {
  await execFileAsync(execPath, ["--loader", "./dist/loader.js", "tests/fixtures/importmap-modules.js"]);
});

async function stopServer(server) {
  const hasExited = server.exitCode !== null || server.signalCode !== null;
  if (hasExited) return;
  const exited = once(server, "exit");
  server.kill();
  await exited;
}

async function serverUrl(server) {
  let errors = "";
  server.stderr.on("data", (chunk) => {
    errors += chunk;
  });
  const { stdout } = server;
  const output = createInterface({ input: stdout });
  const ready = once(output, "line").then(([line]) => {
    const port = line.match(/Listen on the port (\d+)/)?.[1];
    assert.ok(port, `Unexpected server output: ${line}`);
    const url = `http://localhost:${port}`;
    return url;
  });
  const exited = once(server, "exit").then(([code]) => {
    throw new Error(`Server exited with code ${code}: ${errors}`);
  });
  const result = Promise.race([ready, exited]);
  return result;
}

test("serves HTTP requests through remotely loaded Express", { timeout: 65000 }, async (t) => {
  const env = { ...process.env, PORT: "0", NO_COLOR: "1" };
  const stdio = ["ignore", "pipe", "pipe"];
  const server = spawn(execPath, ["--loader", "./dist/loader.js", "tests/e2e/test-server.js"], {
    env,
    timeout: 60000,
    stdio,
  });
  t.after(() => stopServer(server));
  const url = await serverUrl(server);
  const response = await fetch(url);
  assert.equal(response.status, 200);
  assert.equal(await response.text(), "Hi there");
  const mapResponse = await fetch(`${url}/map`);
  assert.equal(mapResponse.status, 200);
  const map = await mapResponse.json();
  assert.ok(map.imports.express);
});

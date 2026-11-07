import { test } from "node:test";
import type { TestContext } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { env } from "node:process";

const setupScript = resolve("scripts/setup-node.sh");
const nodeVersion = "26.13.0";

const createSetupDirectory = (t: TestContext): string => {
  mkdirSync(".cache", { recursive: true });
  const directory = mkdtempSync(resolve(".cache/node-setup-test-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  return directory;
};

const writeExecutable = (directory: string, name: string, source: string): void => {
  const path = join(directory, name);
  writeFileSync(path, source, { mode: 0o755 });
};

const runSetup = (directory: string, version = nodeVersion) => {
  const executablePath = `${directory}/commands:/usr/bin:/bin`;
  const environment = Object.assign({}, env, { NODE_VERSION: version, PATH: executablePath });
  const result = spawnSync("/bin/sh", [setupScript], { cwd: directory, env: environment, encoding: "utf8" });
  return result;
};

test("Node setup rejects an invalid version before downloading", (t) => {
  const directory = createSetupDirectory(t);
  const result = runSetup(directory, "26/../../unexpected");
  assert.equal(result.status, 1);
  assert.equal(existsSync(join(directory, ".cache")), false);
});

test("Node setup reuses its pinned runtime without network access", (t) => {
  const directory = createSetupDirectory(t);
  const binDirectory = join(directory, ".bin");
  mkdirSync(binDirectory);
  writeExecutable(binDirectory, "node", `#!/bin/sh\nprintf 'v${nodeVersion}\\n'\n`);
  writeExecutable(binDirectory, "npm", "#!/bin/sh\nexit 0\n");
  const commands = join(directory, "commands");
  mkdirSync(commands);
  writeExecutable(commands, "curl", "#!/bin/sh\nexit 99\n");
  writeExecutable(commands, "uname", "#!/bin/sh\nexit 99\n");
  const result = runSetup(directory);
  assert.equal(result.status, 0, result.stderr);
});

test("Node setup rejects a bad checksum before extracting the archive", (t) => {
  const directory = createSetupDirectory(t);
  const commands = join(directory, "commands");
  mkdirSync(commands);
  writeExecutable(commands, "uname", '#!/bin/sh\ncase "$1" in -s) echo Linux;; -m) echo x86_64;; esac\n');
  const manifest = `${"0".repeat(64)}  node-v${nodeVersion}-linux-x64.tar.gz`;
  const curlScript = `#!/bin/sh
for output do :; done
case "$*" in
  *SHASUMS256.txt*) printf '%s\\n' '${manifest}' > "$output";;
  *) printf 'unverified archive' > "$output";;
esac
`;
  writeExecutable(commands, "curl", curlScript);
  writeExecutable(commands, "tar", "#!/bin/sh\ntouch extracted\n");
  const result = runSetup(directory);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}${result.stderr}`, /FAILED|did NOT match/);
  assert.equal(existsSync(join(directory, "extracted")), false);
  assert.equal(existsSync(join(directory, ".bin")), false);
});

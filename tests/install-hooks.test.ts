import { test } from "node:test";
import type { TestContext } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { cwd, env } from "node:process";

type HookFixture = { directory: string; environment: NodeJS.ProcessEnv };

const projectDirectory = cwd();
const installer = resolve("scripts/install-hooks.sh");
const fakeGit = `#!/bin/sh
case "$1" in
  rev-parse) printf '%s/hooks\\n' "$PWD";;
  config) [ -n "$TEST_HOOKS_PATH" ] && printf '%s\\n' "$TEST_HOOKS_PATH" || exit 1;;
  *) exit 98;;
esac
`;

const createFixture = (t: TestContext): HookFixture => {
  mkdirSync(".cache", { recursive: true });
  const directory = mkdtempSync(resolve(".cache/hook-install-test-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const commands = join(directory, "commands");
  mkdirSync(commands);
  writeFileSync(join(commands, "git"), fakeGit, { mode: 0o755 });
  const fakeChomp = "#!/bin/sh\nprintf '%s\\n' \"$1\"\n";
  writeFileSync(join(commands, "chomp"), fakeChomp, { mode: 0o755 });
  const executablePath = `${commands}:${env.PATH ?? "/usr/bin:/bin"}`;
  const environment = Object.assign({}, env, { PATH: executablePath });
  const fixture = { directory, environment };
  return fixture;
};

const install = (fixture: HookFixture, ci = "", customPath = "") => {
  const { directory, environment: fixtureEnvironment } = fixture;
  const environment = Object.assign({}, fixtureEnvironment, { CI: ci, TEST_HOOKS_PATH: customPath });
  const result = spawnSync("/bin/sh", [installer], { cwd: directory, env: environment, encoding: "utf8" });
  return result;
};

const checkHook = (fixture: HookFixture, name: string): void => {
  const hook = join(fixture.directory, "hooks", name);
  const executableBits = statSync(hook).mode & 0o111;
  assert.notEqual(executableBits, 0);
  const syntax = spawnSync("/bin/sh", ["-n", hook], { encoding: "utf8" });
  assert.equal(syntax.status, 0, syntax.stderr);
};

test("hook installation generates executable hooks that dispatch to Chomp", (t) => {
  const fixture = createFixture(t);
  const { directory, environment } = fixture;
  assert.equal(install(fixture).status, 0);
  ["pre-commit", "post-merge", "commit-msg"].forEach((name) => checkHook(fixture, name));
  ["pre-commit", "post-merge"].forEach((name) => {
    const hook = join(directory, "hooks", name);
    const result = spawnSync("/bin/sh", [hook], { cwd: directory, env: environment, encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout.trim(), name);
  });
});

test("the generated commit-message hook validates the supplied file", (t) => {
  const fixture = createFixture(t);
  assert.equal(install(fixture).status, 0);
  const message = join(fixture.directory, "message");
  writeFileSync(message, "fix: handle missing modules\n");
  const hook = join(fixture.directory, "hooks", "commit-msg");
  const result = spawnSync("/bin/sh", [hook, message], { cwd: projectDirectory, env, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
});

test("hook installation preserves existing hooks on repeated runs", (t) => {
  const fixture = createFixture(t);
  mkdirSync(join(fixture.directory, "hooks"));
  const hook = join(fixture.directory, "hooks", "pre-commit");
  const original = "#!/bin/sh\nexit 7\n";
  writeFileSync(hook, original, { mode: 0o755 });
  assert.equal(install(fixture).status, 0);
  assert.equal(install(fixture).status, 0);
  assert.equal(readFileSync(hook, "utf8"), original);
});

test("hook installation skips CI", (t) => {
  const fixture = createFixture(t);
  assert.equal(install(fixture, "true").status, 0);
  assert.equal(existsSync(join(fixture.directory, "hooks")), false);
});

test("hook installation leaves custom hooks paths unchanged", (t) => {
  const fixture = createFixture(t);
  const result = install(fixture, "", ".custom-hooks");
  assert.equal(result.status, 1);
  assert.match(result.stderr, /core.hooksPath/);
  assert.equal(existsSync(join(fixture.directory, "hooks")), false);
});

import { readFileSync } from "node:fs";
import { argv, stderr } from "node:process";

const messagePath = argv[2];
if (!messagePath) throw new Error("Provide a commit-message file path.");

const header = readFileSync(messagePath, "utf8").split(/\r?\n/, 1)[0];
const format = /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert|breaking)(\([^)]+\))?!?: \S.*$/;
const isConventional = format.test(header);
const isMerge = header.startsWith("Merge ");
const isValid = (isConventional || isMerge) && header.length <= 120;

if (!isValid) {
  stderr.write("Expected <type>(<scope>): <message>, at most 120 characters.\n");
  process.exitCode = 1;
}

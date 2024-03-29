import express from "express";
import morgan from "morgan";
import chalk from 'chalk'
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const app = express();
app.use(morgan("tiny"));
app.get("/", (_, response) => {
  response.send("Hi there");
});

app.get("/map", (_, response) => {
  const nodeImportMapPath = join(
    fileURLToPath(new URL(".", import.meta.url)),
    "node.importmap"
  );
  response.json(
    JSON.parse(readFileSync(nodeImportMapPath, { encoding: "utf8" }))
  );
});

app.listen(3000, () => {
  console.log(chalk.green("Listen on the port 3000..."));
});

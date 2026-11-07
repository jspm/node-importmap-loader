import express from "express";
import morgan from "morgan";
import chalk from "chalk";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const app = express();
app.use(morgan("tiny"));
app.get("/", (_, response) => {
  response.send("Hi there");
});

app.get("/map", (_, response) => {
  const basePath = process.cwd();
  const importmapJsonPath = join(basePath, "importmap.json");
  const legacyNodeImportmapPath = join(basePath, "node.importmap");

  const useLegacyMap = !existsSync(importmapJsonPath) && existsSync(legacyNodeImportmapPath);
  let nodeImportMapPath = importmapJsonPath;
  if (useLegacyMap) nodeImportMapPath = legacyNodeImportmapPath;

  response.json(JSON.parse(readFileSync(nodeImportMapPath, { encoding: "utf8" })));
});

const port = Number(process.env.PORT ?? 3000);
const server = app.listen(port, () => {
  const address = server.address();
  console.log(chalk.green(`Listen on the port ${address.port}...`));
});

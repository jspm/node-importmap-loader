# @jspm/node-importmap-loader

![Typed with TypeScript](https://flat.badgen.net/badge/icon/Typed?icon=typescript&label&labelColor=blue&color=555555)
[![npm version](https://badge.fury.io/js/@jspm%2Fnode-importmap-loader.svg)](https://badge.fury.io/js/@jspm%2Fnode-importmap-loader)
![ci](https://github.com/jspm/node-importmap-http-loader/actions/workflows/ci.yml/badge.svg)
[![Github](https://badgen.net/badge/icon/github?icon=github&label&color=black)](https://github.com/jspm/node-importmap-http-loader)

#### Don't bother installing dependencies you don't need to! 🏇🏻💨

With `@jspm/node-importmap-loader`, you can reference and execute dependencies directly to maximize productivity ⚡️,
decrease security risk 🚔!

---

## Requirements

#### Node 22+

`@jspm/node-importmap-loader` supports Node 22+ and uses Node's [module loaders](https://nodejs.org/api/esm.html#loaders) and native `fetch`.

Development uses the Node 26 version pinned in `chompfile.toml`. With standalone [Chomp](https://github.com/guybedford/chomp) installed, run `chomp setup`. It downloads the official Node archive, verifies its SHA-256 checksum, and installs the development dependencies. Setup supports macOS and Linux on x64 and arm64 and requires `curl`, `tar`, and either `sha256sum` or `shasum`.

Chomp tasks use the project-local Node installation through `.bin/`; the downloaded runtime stays in `.cache/dev-node/`. `chomp node:version` prints the selected version. Development CI and the devcontainer use the same setup task.

Tests use `node:test` and Node's built-in mocks. `chomp test` compiles the TypeScript tests with the existing `tsup` compiler and runs the unit and end-to-end tests.

Chomp remains the task runner. `npm run lint` uses Oxlint; `npm run format` uses Oxfmt, and `npm run format:check` checks formatting without writing files.

`chomp prepare` runs `scripts/install-hooks.sh` to generate executable hooks in Git's hooks directory. It preserves existing hooks, skips CI, and leaves custom `core.hooksPath` settings unchanged. The commit-message hook checks Conventional Commit headers and a 120-character limit without commitlint. Pre-commit checks run through Chomp without rewriting files.

---

## Usage

Getting started with `@jspm/node-importmap-loader` can be done in 2 steps!

#### 1. Install

```bash
npm install @jspm/node-importmap-loader --save-dev
```

#### 2. Execute

With an `importmap.json` defined in your working directory, run

```bash
load-node-importmap <file-to-execute>
```

#### Examples and demos coming soon ⏰!

---

## Comparisions

Additionally, `@jspm/node-importmap-loader` can produce significant size benefits

#### With regular npm install

```sh
du -hs node_modules
50M    node_modules
```

#### With `@jspm/node-importmap-loader`

```sh
du -sh .cache
3.6M    .cache
```

#### And it takes almost the same time to execute scripts!

---

## Wow! Awesome! How do I Contribute?

#### 1. Clone

```sh
git clone git@github.com:jspm/node-importmap-loader.git
```

#### 2. Devcontainer

Then, via [devcontainers](https://code.visualstudio.com/docs/remote/containers), launch the container by clicking the devcontainer button or via the command palette.

#### To setup devcontainers

1. Launch [vscode](https://code.visualstudio.com/) or your favorite devcontainers enabled editor
1. Install [Remote Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension
1. Launch the container by clicking the devcontainer button or via the command palette

---

#### Local development

Install standalone Chomp, then:

```sh
git clone git@github.com:jspm/node-importmap-loader.git
cd node-importmap-loader
chomp setup
```

---

#### 📣 _More how-tos, documentation coming soon!_

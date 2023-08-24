# @jspm/node-importmap-loader

![Typed with TypeScript](https://flat.badgen.net/badge/icon/Typed?icon=typescript&label&labelColor=blue&color=555555)
[![npm version](https://badge.fury.io/js/@jspm/node-importmap-loader.svg)](https://badge.fury.io/js/@jspm/node-importmap-loader)
![ci](https://github.com/jspm/node-importmap-http-loader/actions/workflows/ci.yml/badge.svg)
[![Github](https://badgen.net/badge/icon/github?icon=github&label&color=black)](https://github.com/jspm/node-importmap-http-loader)

#### Don't bother installing dependencies you don't need to! 🏇🏻💨

With `@jspm/node-importmap-loader`, you can reference and execute dependencies directly to maximize productivity ⚡️,
decrease security risk 🚔!

---

## Usage

Getting started with `@jspm/node-importmap-loader` can be done in 2 steps!

#### 1. Install

```bash
npm install @jspm/node-importmap-loader --save-dev
```

#### 2. Execute

With a `node.importmap` defined in your working directory, run

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
git clone git@github.com:jspm/node-importmap-http-loader.git
```

#### 2. Devcontainer

Then, via [devcontainers](https://code.visualstudio.com/docs/remote/containers), launch the container by clicking the devcontainer button or via the command palette.

#### To setup devcontainers

1. Launch [vscode](https://code.visualstudio.com/) or your favorite devcontainers enabled editor
1. Install [Remote Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension
1. Launch the container by clicking the devcontainer button or via the command palette

---

#### Old school contributing setup

Unrecommended setup

```sh
git clone git@github.com:jspm/node-importmap-http-loader.git
n install auto && npm install
```

---

#### 📣 _More how-tos, documentation coming soon!_

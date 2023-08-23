# @jspm/node-importmap-loader

![Typed with TypeScript](https://flat.badgen.net/badge/icon/Typed?icon=typescript&label&labelColor=blue&color=555555)
[![npm version](https://badge.fury.io/js/node-importmap-http-loader.svg)](https://badge.fury.io/js/node-importmap-http-loader)
![ci](https://github.com/yowainwright/node-importmap-http-loader/actions/workflows/ci.yml/badge.svg)
[![Github](https://badgen.net/badge/icon/github?icon=github&label&color=black)](https://github.com/yowainwright/node-importmap-http-loader)
#### Don't bother installing dependencies you don't need to! 🏇🏻💨

With **@JSPM/_node-importmap-loader_**, installing node modules is a thing of the past! You can reference and execute them directly to maximize productivity ⚡️, decrease security risk 🚔, and probably otherawesome things too! Use **JSPM _node-importmap-loader_** today!

---

#### I'm skeptical. Is this for real?

Sort of **yes _and_ no**—it's close! This project's focus is to enable you to use [import maps](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap) with Node if you have familiarity both technologies and [EcmaScript Modules (ESM)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules).

#### How does this work?

JSPM uses [Node's experimental loader](https://nodejs.org/api/esm.html#esm_import_map_loader) and JSPM import maps enabling _you_ 🫵 to import dependencies directly from a cdn source _without needing to install them_!

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

---

## For Example

When executing

```bash
node --loader ./dist/loader.js test.js
```

In this repo the following will be output

```bash
 loader git:(main) node --loader ./loader.js test.js
(node:12944) ExperimentalWarning: --experimental-loader is an experimental feature. This feature could change at any time
(Use `node --trace-warnings ...` to show where the warning was created)
testing
{
  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: {
    usingClientEntryPoint: false,
    Events: [
      [Function: getInstanceFromNode],
      [Function: getNodeFromInstance],
      [Function: getFiberCurrentPropsFromNode],
      [Function: enqueueStateRestore],
      [Function: restoreStateIfNeeded],
      [Function: batchedUpdates$1]
    ]
  },
  createPortal: [Function: createPortal$1],
  createRoot: [Function: createRoot$1],
  findDOMNode: [Function: findDOMNode],
  flushSync: [Function: flushSync$1],
  hydrate: [Function: hydrate],
  hydrateRoot: [Function: hydrateRoot$1],
  render: [Function: render],
  unmountComponentAtNode: [Function: unmountComponentAtNode],
  unstable_batchedUpdates: [Function: batchedUpdates$1],
  unstable_renderSubtreeIntoContainer: [Function: renderSubtreeIntoContainer],
  version: '18.2.0'
}
```

This output represents a product that is ready to be used without locally installing dependencies!

Additionally, this produces significant size benefits

#### With regular npm install

```sh
du -hs node_modules
50M    node_modules
```

#### With `@jspm/node-importmap-loader``

```sh
du -sh .cache
3.6M    .cache
```

And takes almost the same time to execute scripts!

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

# @jspm/node-importmap-generator

##### Don't bother installing dependencies you don't need to! 🏇🏻💨

With **JSPM** **_node-importmap-loader_**, you no longer need to install dependencies! You can execute them directly! This increases productivity ⚡️, decreases security risk 🚔, and probably does other awesome things too!

JSPM uses [Node's experimental loader methodology](https://nodejs.org/api/esm.html#esm_import_map_loader) with JSPM's import map technology to allow _you_ 🫵 to import dependencies directly from a cdn source without needing to install them!

More how-tos, documentation coming soon!

---

## Usage

When executing the `jspm-node-importmap-loader`, followed by a file containing the node modules you'd like to reference

```sh
npx jspm-node-importmap-loader test/e2e/test.js
```

The following will be output

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

### Size Benefits

One very significant upside of using deps using the `loader` and `import-map`. The dependencies from `test.js` loads

```sh
du -sh -I @jspm -I fs-extra -I node-fetch node_modules
50M    node_modules
```

```sh
du -sh .cache
3.6M    .cache
```

---

## Local Development

Try it yourself

Clone

```sh
git clone git@github.com:jspm/node-importmap-http-loader.git
```

Then via [devcontainers](https://code.visualstudio.com/docs/remote/containers), launch the container by clicking the devcontainer button or via the command palette.

To setup devcontainers

1. Launch [vscode](https://code.visualstudio.com/) or your favorite devcontainers enabled editor
1. Install [Remote Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension
1. Launch the container by clicking the devcontainer button or via the command palette

---

Unrecommended and supported for issues, etc:

```sh
git clone git@github.com:jspm/node-importmap-http-loader.git
nvm install && npm install
```

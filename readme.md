# Node ImportMap HTTP Loader

Experimental node loader built on top of jspm utils to resolve deps from remote in nodejs

---

## Usage

When executing

```sh
node --loader ./loader.js test.js
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
nvm i && npm i
```

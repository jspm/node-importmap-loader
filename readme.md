Experimental node loader built on top of jspm utils to resovlve deps from remote in nodejs

```sh
node --loader ./loader.js test.js
```

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

## Size

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

Clone

```sh
git clone git@github.com:JayaKrishnaNamburu/docusaurus-node-polyfills.git
```

*For, Strictly local development:

```sh
./bin/setup.sh && bun install
```

1. Installs [nvm]()
1. Installs [nodejs 18]()
1. Installs latest [bun]()
1. Installs deps

*Local development issues will be ignored. Please use a container.

---

Or, via vscode [devcontainer](https://code.visualstudio.com/docs/remote/containers):

1. Launch [vscode](https://code.visualstudio.com/)
1. Install [Remote - Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension
1. Launch the container by clicking the devcontainer button or via the command palette

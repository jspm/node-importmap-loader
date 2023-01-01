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
import assert from "node:assert/strict";
import * as react from "react";
import * as reactRouter from "react-router";
import * as reactRouterDom from "react-router-dom";

assert.equal(typeof react.createElement, "function");
assert.equal(typeof reactRouter.matchPath, "function");
assert.equal(typeof reactRouterDom.BrowserRouter, "function");

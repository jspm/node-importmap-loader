# ESLint via ImportMap Demo

This demo showcases using ESLint without installing it as a devDependency. Instead, ESLint is loaded directly from a CDN using importmaps.

## 🎯 Key Features

- **Zero node_modules for ESLint**: ESLint and its dependencies are not installed locally
- **Fast setup**: No npm install needed for ESLint
- **Reduced disk space**: Significantly smaller project footprint
- **CDN-powered**: Dependencies loaded from jspm.io CDN

## 🚀 How to Run

1. Install only the importmap loader:
```bash
npm install
```

2. Run the ESLint demo:
```bash
npm run lint
```

## 📊 Size Comparison

Compare the node_modules size with traditional vs importmap approach:

```bash
# Traditional approach (ESLint as devDependency)
npm run size:traditional

# ImportMap approach (no ESLint in node_modules)
npm run size:importmap
```

## 🔧 How It Works

1. **node.importmap**: Defines URL mappings for ESLint and its dependencies
2. **@jspm/node-importmap-loader**: Node.js loader that resolves imports using the importmap
3. **Direct CDN loading**: ESLint is loaded from https://ga.jspm.io at runtime

## 📦 CodeSandbox

This demo is CodeSandbox-compatible. You can:
1. Upload this folder to CodeSandbox
2. Run `npm install` to get the importmap loader
3. Run `npm run lint` to see ESLint in action

## 🎨 Files

- `index.js` - Main demo file that imports and uses ESLint
- `node.importmap` - Import mappings for ESLint and dependencies
- `package.json` - Minimal dependencies (only the loader)
- `.eslintrc.json` - ESLint configuration
# Prettier via ImportMap Demo

This demo showcases using Prettier without installing it as a devDependency. Instead, Prettier is loaded directly from a CDN using importmaps.

## 🎯 Key Features

- **Zero node_modules for Prettier**: Prettier is not installed locally
- **Fast setup**: No npm install needed for Prettier
- **Reduced disk space**: Minimal project footprint
- **CDN-powered**: Prettier loaded from jspm.io CDN

## 🚀 How to Run

1. Install only the importmap loader:
```bash
npm install
```

2. Run the Prettier demo:
```bash
npm run format
```

## 📊 Size Comparison

Compare the node_modules size with traditional vs importmap approach:

```bash
# Traditional approach (Prettier as devDependency)
npm run size:traditional

# ImportMap approach (no Prettier in node_modules)
npm run size:importmap
```

## 🔧 How It Works

1. **node.importmap**: Defines URL mappings for Prettier
2. **@jspm/node-importmap-loader**: Node.js loader that resolves imports using the importmap
3. **Direct CDN loading**: Prettier is loaded from https://ga.jspm.io at runtime

## 📦 CodeSandbox

This demo is CodeSandbox-compatible. You can:
1. Upload this folder to CodeSandbox
2. Run `npm install` to get the importmap loader
3. Run `npm run format` to see Prettier in action

## 🎨 Files

- `index.js` - Main demo file that imports and uses Prettier
- `node.importmap` - Import mappings for Prettier
- `package.json` - Minimal dependencies (only the loader)
- `sample.js` - Generated file with unformatted code
- `sample.formatted.js` - Generated file with formatted code

## 💡 Benefits

- **Smaller node_modules**: Prettier alone can add ~7MB to node_modules
- **Faster CI/CD**: No need to install formatting tools in pipelines
- **Version flexibility**: Easy to switch Prettier versions by updating importmap
- **Tool isolation**: Development tools don't bloat production dependencies
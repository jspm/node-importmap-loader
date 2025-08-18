# Prettier via ImportMap - Docker Demo

This demo showcases running Prettier in a Docker container without installing it as a devDependency.

## 🐳 Docker Commands

Build the Docker image:
```bash
npm run docker:build
# or
docker build -t prettier-importmap-demo .
```

Run the demo:
```bash
npm run docker:run
# or
docker run --rm prettier-importmap-demo
```

Interactive shell:
```bash
npm run docker:shell
# or
docker run --rm -it prettier-importmap-demo sh
```

## 📊 Container Size Benefits

The Docker image is significantly smaller because:
- No Prettier in node_modules (saves ~7MB)
- Only the importmap loader is installed
- Prettier is fetched from CDN at runtime

## 🔧 How It Works

1. **Minimal Docker image**: Based on node:24-alpine for small size
2. **Single dependency**: Only @jspm/node-importmap-loader installed
3. **Runtime resolution**: Prettier loaded from CDN when needed
4. **Fast builds**: Docker layer caching with minimal dependencies

## 📁 Files

- `Dockerfile` - Docker configuration
- `index.js` - Prettier demo code
- `node.importmap` - Import mappings
- `package.json` - Minimal dependencies
- `.dockerignore` - Excluded files from Docker context

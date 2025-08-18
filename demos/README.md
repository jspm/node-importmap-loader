# Node ImportMap Loader Demos

These demos showcase the key features and benefits of `@jspm/node-importmap-loader`:

## 🎯 Key Features Demonstrated

1. **Minimal node_modules size** - Tools are loaded from CDN instead of being installed locally
2. **DevTools without devDependencies** - Use ESLint, Prettier, and other tools without installing them

## 📁 Demo Structure

```
demos/
├── local/           # Demos that run locally (CodeSandbox compatible)
│   ├── eslint/      # ESLint via importmap
│   └── prettier/    # Prettier via importmap
├── docker/          # Docker containerized demos
│   ├── eslint/      # ESLint in Docker with Node 24
│   └── prettier/    # Prettier in Docker with Node 24
└── comparison.sh    # Size comparison script
```

## 🚀 Quick Start

### Quick Setup (All Demos)

```bash
./setup.sh
```

This script will:
- Install @jspm/node-importmap-loader in each demo
- Generate importmaps using @jspm/generator
- Prepare all demos for immediate use

### Local Demos

**ESLint Demo:**
```bash
cd local/eslint
npm install              # Install importmap loader only
npm run setup            # Generate importmap with jspm
npm run lint             # Run ESLint via importmap
```

**Prettier Demo:**
```bash
cd local/prettier
npm install              # Install importmap loader only
npm run setup            # Generate importmap with jspm
npm run format           # Run Prettier via importmap
```

### Docker Demos

**ESLint Docker:**
```bash
cd docker/eslint
npm run docker:build
npm run docker:run
```

**Prettier Docker:**
```bash
cd docker/prettier
npm run docker:build
npm run docker:run
```

## 📊 Size Comparison

Run the comparison script to see detailed disk space savings:

```bash
./comparison.sh
```

This will display a comprehensive comparison table showing:
- Traditional approach: ESLint/Prettier as devDependencies
- ImportMap approach: Single small loader dependency + jspm-generated importmaps
- Space savings: Typically 90%+ reduction in node_modules size
- File count comparison: Shows dramatic reduction in number of files

The script measures:
- ESLint alone vs ImportMap loader
- Prettier alone vs ImportMap loader
- ESLint + Prettier combined vs ImportMap loader
- Exact percentage savings for each scenario
- Generates importmaps using @jspm/generator for accurate comparison

## 🎨 Demo Features

### Local Demos (CodeSandbox Compatible)
- Can be uploaded directly to CodeSandbox
- Minimal setup required
- Shows real-time tool execution via CDN

### Docker Demos
- Uses Node 24 Alpine for minimal container size
- Demonstrates production-ready containerization
- Shows how importmaps work in isolated environments

## 💡 Benefits Highlighted

1. **Small node_modules**: ~3MB vs ~50MB+ for traditional approach
2. **Fast CI/CD**: No need to install dev tools in pipelines
3. **Version flexibility**: Update tool versions via importmap
4. **Tool isolation**: No version conflicts between tools
5. **CDN caching**: Tools cached and shared across projects

## 🔧 How It Works

1. **@jspm/generator**: Generates importmaps that map package names to CDN URLs
2. **node.importmap**: Contains the generated mappings from jspm
3. **@jspm/node-importmap-loader**: Node.js loader that resolves imports using the importmap
4. **Runtime resolution**: Tools loaded from CDN when needed
5. **No local installation**: Tools run without being in node_modules

## 📦 CodeSandbox Deployment

The `local/` demos are designed for CodeSandbox:

1. Upload the demo folder to CodeSandbox
2. Run `npm install` (installs only the loader)
3. Run `npm run setup` (generates importmap with jspm)
4. Execute the demo scripts
5. See tools running without being installed!

## 🐳 Docker Deployment

The `docker/` demos show production containerization:

1. Minimal Alpine Linux base image
2. Single dependency installation
3. Tools loaded at runtime from CDN
4. Significantly smaller container images

## 📈 Real-World Impact

- **ESLint**: ~50MB → ~3MB (94% reduction)
- **Prettier**: ~7MB → ~3MB (57% reduction)
- **Combined**: ~57MB → ~3MB (95% reduction)

These savings multiply across:
- Multiple projects
- CI/CD pipelines
- Docker images
- Development environments
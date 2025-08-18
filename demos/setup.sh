#!/usr/bin/env bash

# Setup script for all demos
# This ensures jspm is used to generate importmaps properly

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${BOLD}🚀 Setting up Node ImportMap Loader demos${NC}\n"

# Function to setup a demo
setup_demo() {
    local demo_path=$1
    local demo_name=$2
    
    echo -e "${YELLOW}Setting up $demo_name...${NC}"
    cd "$demo_path"
    
    # Install dependencies (just the loader)
    echo "  Installing @jspm/node-importmap-loader..."
    npm install --silent 2>/dev/null || npm install
    
    # Generate importmap using jspm
    echo "  Generating importmap with jspm..."
    npm run setup --silent 2>/dev/null || npm run setup
    
    echo -e "${GREEN}✅ $demo_name setup complete!${NC}\n"
    cd - > /dev/null
}

# Setup local demos
echo -e "${BLUE}📁 Setting up local demos...${NC}\n"
setup_demo "local/eslint" "ESLint demo"
setup_demo "local/prettier" "Prettier demo"

# Check if Docker is available
if command -v docker &> /dev/null; then
    echo -e "${BLUE}🐳 Docker is available. You can build Docker demos with:${NC}"
    echo "  cd docker/eslint && npm run docker:build"
    echo "  cd docker/prettier && npm run docker:build"
else
    echo -e "${YELLOW}⚠️  Docker not found. Skipping Docker demo setup.${NC}"
fi

echo -e "${GREEN}${BOLD}✨ All demos are set up and ready to use!${NC}\n"

echo -e "${BLUE}Try these commands:${NC}"
echo "  cd local/eslint && npm run lint"
echo "  cd local/prettier && npm run format"
echo ""
echo -e "${BLUE}Compare sizes:${NC}"
echo "  ./comparison.sh"
echo ""
echo -e "${BLUE}Run benchmarks:${NC}"
echo "  ./benchmark.sh"
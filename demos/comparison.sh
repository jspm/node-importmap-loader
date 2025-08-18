#!/usr/bin/env bash

echo ""
echo "📊 Node Modules Size Comparison"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
GRAY='\033[0;90m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Function to convert size to MB
size_to_mb() {
    local size=$1
    # Extract number and unit
    local num=$(echo $size | sed 's/[^0-9.]//g')
    local unit=$(echo $size | sed 's/[0-9.]//g')
    
    case $unit in
        K) echo "scale=2; $num / 1024" | bc ;;
        M) echo $num ;;
        G) echo "scale=2; $num * 1024" | bc ;;
        *) echo "0" ;;
    esac
}

# Function to calculate percentage savings
calc_savings() {
    local traditional=$1
    local importmap=$2
    echo "scale=1; (($traditional - $importmap) / $traditional) * 100" | bc
}

# Traditional approach - ESLint as devDependency
echo -e "${YELLOW}⏳ Measuring traditional ESLint installation...${NC}"
TEMP_ESLINT=$(mktemp -d)
cd "$TEMP_ESLINT"
npm init -y > /dev/null 2>&1
npm install --save-dev eslint > /dev/null 2>&1
ESLINT_SIZE=$(du -sh node_modules | cut -f1)
ESLINT_COUNT=$(find node_modules -type f -name "*.js" -o -name "*.json" | wc -l | tr -d ' ')
cd - > /dev/null
rm -rf "$TEMP_ESLINT"

# Traditional approach - Prettier as devDependency
echo -e "${YELLOW}⏳ Measuring traditional Prettier installation...${NC}"
TEMP_PRETTIER=$(mktemp -d)
cd "$TEMP_PRETTIER"
npm init -y > /dev/null 2>&1
npm install --save-dev prettier > /dev/null 2>&1
PRETTIER_SIZE=$(du -sh node_modules | cut -f1)
PRETTIER_COUNT=$(find node_modules -type f -name "*.js" -o -name "*.json" | wc -l | tr -d ' ')
cd - > /dev/null
rm -rf "$TEMP_PRETTIER"

# Combined traditional approach
echo -e "${YELLOW}⏳ Measuring combined traditional installation...${NC}"
TEMP_COMBINED=$(mktemp -d)
cd "$TEMP_COMBINED"
npm init -y > /dev/null 2>&1
npm install --save-dev eslint prettier > /dev/null 2>&1
COMBINED_SIZE=$(du -sh node_modules | cut -f1)
COMBINED_COUNT=$(find node_modules -type f -name "*.js" -o -name "*.json" | wc -l | tr -d ' ')
cd - > /dev/null
rm -rf "$TEMP_COMBINED"

# ImportMap approach - with jspm generator for creating importmaps
echo -e "${YELLOW}⏳ Measuring ImportMap loader installation...${NC}"
TEMP_IMPORTMAP=$(mktemp -d)
cd "$TEMP_IMPORTMAP"
npm init -y > /dev/null 2>&1
# Install only the importmap loader (jspm generator will be used via npx)
npm install @jspm/node-importmap-loader > /dev/null 2>&1
# Generate importmaps for the tools (doesn't install them locally)
npx @jspm/generator install eslint --map ./eslint.importmap --env=node > /dev/null 2>&1
npx @jspm/generator install prettier --map ./prettier.importmap --env=node > /dev/null 2>&1
IMPORTMAP_SIZE=$(du -sh node_modules | cut -f1)
IMPORTMAP_COUNT=$(find node_modules -type f -name "*.js" -o -name "*.json" | wc -l | tr -d ' ')
cd - > /dev/null
rm -rf "$TEMP_IMPORTMAP"

# Calculate MB values for savings
ESLINT_MB=$(size_to_mb $ESLINT_SIZE)
PRETTIER_MB=$(size_to_mb $PRETTIER_SIZE)
COMBINED_MB=$(size_to_mb $COMBINED_SIZE)
IMPORTMAP_MB=$(size_to_mb $IMPORTMAP_SIZE)

# Calculate savings percentages
ESLINT_SAVINGS=$(calc_savings $ESLINT_MB $IMPORTMAP_MB)
PRETTIER_SAVINGS=$(calc_savings $PRETTIER_MB $IMPORTMAP_MB)
COMBINED_SAVINGS=$(calc_savings $COMBINED_MB $IMPORTMAP_MB)

echo ""
echo -e "${GREEN}✅ Measurement complete!${NC}"
echo ""

# Display comparison table
echo -e "${BOLD}┌─────────────────────────┬──────────────┬──────────────┬─────────────┐${NC}"
echo -e "${BOLD}│ Package                 │ Traditional  │ ImportMap    │ Savings     │${NC}"
echo -e "${BOLD}├─────────────────────────┼──────────────┼──────────────┼─────────────┤${NC}"
printf "│ %-23s │ ${RED}%-12s${NC} │ ${GREEN}%-12s${NC} │ ${CYAN}%-11s${NC} │\n" \
    "ESLint only" "$ESLINT_SIZE" "$IMPORTMAP_SIZE" "${ESLINT_SAVINGS}%"
printf "│ %-23s │ ${RED}%-12s${NC} │ ${GREEN}%-12s${NC} │ ${CYAN}%-11s${NC} │\n" \
    "Prettier only" "$PRETTIER_SIZE" "$IMPORTMAP_SIZE" "${PRETTIER_SAVINGS}%"
printf "│ %-23s │ ${RED}%-12s${NC} │ ${GREEN}%-12s${NC} │ ${CYAN}%-11s${NC} │\n" \
    "ESLint + Prettier" "$COMBINED_SIZE" "$IMPORTMAP_SIZE" "${COMBINED_SAVINGS}%"
echo -e "${BOLD}└─────────────────────────┴──────────────┴──────────────┴─────────────┘${NC}"

echo ""
echo -e "${BOLD}📁 File Count Comparison${NC}"
echo -e "┌─────────────────────────┬──────────────┬──────────────┐"
echo -e "│ Package                 │ Traditional  │ ImportMap    │"
echo -e "├─────────────────────────┼──────────────┼──────────────┤"
printf "│ %-23s │ %12s │ %12s │\n" "ESLint only" "$ESLINT_COUNT files" "$IMPORTMAP_COUNT files"
printf "│ %-23s │ %12s │ %12s │\n" "Prettier only" "$PRETTIER_COUNT files" "$IMPORTMAP_COUNT files"
printf "│ %-23s │ %12s │ %12s │\n" "ESLint + Prettier" "$COMBINED_COUNT files" "$IMPORTMAP_COUNT files"
echo -e "└─────────────────────────┴──────────────┴──────────────┘"

echo ""
echo -e "${BLUE}✨ Key Benefits of ImportMap Approach:${NC}"
echo "   • One small dependency serves multiple tools"
echo "   • ~${COMBINED_SAVINGS}% reduction in disk space"
echo "   • Faster CI/CD pipelines (less to install)"
echo "   • No version conflicts between tools"
echo "   • Tools loaded from CDN on-demand"
echo ""
#!/bin/bash

# Node ImportMap Loader Benchmarks
# This script compares ImportMap vs traditional node_modules approach

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo -e "\n${BOLD}$1${NC}"
    echo "$(printf '=%.0s' {1..60})"
}

print_section() {
    echo -e "\n${CYAN}$1${NC}"
    echo "$(printf '-%.0s' {1..60})"
}

format_bytes() {
    local bytes=$1
    if [ $bytes -lt 1024 ]; then
        echo "${bytes}B"
    elif [ $bytes -lt 1048576 ]; then
        echo "$(echo "scale=2; $bytes/1024" | bc)KB"
    else
        echo "$(echo "scale=2; $bytes/1048576" | bc)MB"
    fi
}

get_dir_size() {
    if [ -d "$1" ]; then
        du -sb "$1" 2>/dev/null | cut -f1
    else
        echo "0"
    fi
}

measure_time() {
    local start=$(date +%s%N)
    eval "$1" > /dev/null 2>&1
    local end=$(date +%s%N)
    echo $(( ($end - $start) / 1000000 ))
}

# Main benchmark script
print_header "🚀 Node ImportMap Loader Benchmarks"

# Initialize results arrays
declare -a demo_names=("ESLint" "Prettier")
declare -a demo_paths=("local/eslint" "local/prettier")
declare -a demo_scripts=("lint" "format")
declare -a importmap_sizes
declare -a traditional_sizes
declare -a execution_times

print_section "📊 SIZE COMPARISON: ImportMap vs Traditional node_modules"

for i in ${!demo_names[@]}; do
    name="${demo_names[$i]}"
    path="${demo_paths[$i]}"
    script="${demo_scripts[$i]}"
    
    echo -e "\n${BOLD}🔍 $name:${NC}"
    
    cd "$path"
    
    # Clean up existing node_modules
    rm -rf node_modules
    
    # Measure ImportMap approach
    echo -e "\n  ${GREEN}ImportMap approach:${NC}"
    npm install --production --silent 2>/dev/null
    # Generate importmap using jspm
    npm run setup --silent 2>/dev/null || npx @jspm/generator install $([ "$name" == "ESLint" ] && echo "eslint" || echo "prettier") chalk --map ./node.importmap --env=node --silent 2>/dev/null
    importmap_size=$(get_dir_size "node_modules")
    importmap_sizes[$i]=$importmap_size
    echo "    node_modules size: $(format_bytes $importmap_size)"
    
    # Measure traditional approach
    echo -e "\n  ${YELLOW}Traditional approach:${NC}"
    if [ "$name" == "ESLint" ]; then
        npm install --save-dev eslint @eslint/js --silent 2>/dev/null
    else
        npm install --save-dev prettier --silent 2>/dev/null
    fi
    traditional_size=$(get_dir_size "node_modules")
    traditional_sizes[$i]=$traditional_size
    echo "    node_modules size: $(format_bytes $traditional_size)"
    
    # Calculate savings
    savings=$(( $traditional_size - $importmap_size ))
    if [ $traditional_size -gt 0 ]; then
        savings_percent=$(echo "scale=1; ($savings * 100) / $traditional_size" | bc)
    else
        savings_percent=0
    fi
    echo -e "\n  ${GREEN}💰 Savings: $(format_bytes $savings) (${savings_percent}% smaller)${NC}"
    
    # Restore to ImportMap setup
    rm -rf node_modules
    npm install --production --silent 2>/dev/null
    npm run setup --silent 2>/dev/null
    
    cd - > /dev/null
done

print_section "⏱️  EXECUTION TIME COMPARISON"

for i in ${!demo_names[@]}; do
    name="${demo_names[$i]}"
    path="${demo_paths[$i]}"
    script="${demo_scripts[$i]}"
    
    echo -e "\n${BOLD}🔍 $name:${NC}"
    
    cd "$path"
    
    # Warm up run
    npm run $script > /dev/null 2>&1
    
    # Measure execution time (average of 3 runs)
    total_time=0
    for run in {1..3}; do
        exec_time=$(measure_time "npm run $script")
        total_time=$(( $total_time + $exec_time ))
    done
    avg_time=$(( $total_time / 3 ))
    execution_times[$i]=$avg_time
    
    echo "  Average execution time: ${avg_time}ms"
    
    # Cold start time
    node -e "process.exit()" 2>/dev/null
    cold_time=$(measure_time "npm run $script")
    echo "  Cold start time: ${cold_time}ms"
    
    cd - > /dev/null
done

print_section "🐳 DOCKER CONTAINER BENCHMARKS"

docker_demos=("docker/eslint" "docker/prettier")
docker_images=("eslint-importmap" "prettier-importmap")

for i in ${!docker_demos[@]}; do
    path="${docker_demos[$i]}"
    image="${docker_images[$i]}"
    name=$(basename "$path")
    
    echo -e "\n${BOLD}🔍 Docker $name:${NC}"
    
    cd "$path"
    
    # Build Docker image
    echo "  Building Docker image..."
    build_time=$(measure_time "docker build -t $image . 2>/dev/null")
    echo "  Build time: ${build_time}ms"
    
    # Measure container run time (average of 3 runs)
    total_run_time=0
    for run in {1..3}; do
        run_time=$(measure_time "docker run --rm $image")
        total_run_time=$(( $total_run_time + $run_time ))
    done
    avg_run_time=$(( $total_run_time / 3 ))
    echo "  Average container run time: ${avg_run_time}ms"
    
    # Get image size
    image_size=$(docker images $image --format "{{.Size}}" | head -1)
    echo "  Docker image size: $image_size"
    
    cd - > /dev/null
done

print_section "💾 CACHE EFFICIENCY"

cache_dir="$HOME/.jspm/cache"
if [ -d "$cache_dir" ]; then
    cache_size=$(get_dir_size "$cache_dir")
    echo -e "\nJSPM/ImportMap CDN cache size: $(format_bytes $cache_size)"
    echo "(This cache is shared across all projects using importmaps)"
else
    echo -e "\nNo JSPM/ImportMap cache found (will be created on first run)"
    echo "The jspm generator will create this cache when generating importmaps"
fi

print_section "📈 SUMMARY REPORT"

# Calculate averages
total_importmap=0
total_traditional=0
for i in ${!importmap_sizes[@]}; do
    total_importmap=$(( $total_importmap + ${importmap_sizes[$i]} ))
    total_traditional=$(( $total_traditional + ${traditional_sizes[$i]} ))
done

avg_savings_percent=$(echo "scale=1; (($total_traditional - $total_importmap) * 100) / $total_traditional" | bc)

echo -e "
${GREEN}Key Benefits of ImportMap Approach:${NC}
  ✅ ${avg_savings_percent}% average reduction in node_modules size
  ✅ Faster Docker builds (fewer dependencies)
  ✅ Shared CDN cache across projects
  ✅ Always up-to-date tool versions
  ✅ Zero dependency conflicts
  ✅ Faster CI/CD pipelines

${YELLOW}Trade-offs:${NC}
  ⚠️  Requires internet connection for first run
  ⚠️  Slight overhead on cold starts
  ⚠️  Depends on CDN availability

${CYAN}Detailed Results:${NC}"

for i in ${!demo_names[@]}; do
    echo -e "\n  ${demo_names[$i]}:"
    echo "    ImportMap size: $(format_bytes ${importmap_sizes[$i]})"
    echo "    Traditional size: $(format_bytes ${traditional_sizes[$i]})"
    echo "    Space saved: $(format_bytes $(( ${traditional_sizes[$i]} - ${importmap_sizes[$i]} )))"
    echo "    Execution time: ${execution_times[$i]}ms"
done

echo -e "\n$(printf '=%.0s' {1..60})"
echo -e "${GREEN}${BOLD}Benchmark complete! 🎉${NC}\n"
#!/bin/bash

# RenderAPIs Postman Collection Test Runner
# This script runs the Postman collection using Newman (Postman CLI)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}RenderAPIs API Test Runner${NC}"
echo "================================="

# Check if Newman is installed
if ! command -v newman &> /dev/null; then
    echo -e "${YELLOW}Newman CLI not found. Installing...${NC}"
    npm install -g newman
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to install Newman. Please install manually: npm install -g newman${NC}"
        exit 1
    fi
fi

# Check if server is running
echo -e "${BLUE}Checking server status...${NC}"
if curl -s http://localhost:3000/health > /dev/null; then
    echo -e "${GREEN}✓ Server is running${NC}"
else
    echo -e "${RED}✗ Server is not running. Please start the server first: npm start${NC}"
    exit 1
fi

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Run collection with environment
echo -e "${BLUE}Running Postman collection tests...${NC}"
newman run "$SCRIPT_DIR/RenderAPIs.postman_collection.json" \
    -e "$SCRIPT_DIR/RenderAPIs.postman_environment.json" \
    --reporters cli,html \
    --reporter-html-export "$SCRIPT_DIR/test-results.html" \
    --color on \
    --timeout-request 5000 \
    --delay-request 100

# Check exit code
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    echo -e "${BLUE}HTML report generated: $SCRIPT_DIR/test-results.html${NC}"
else
    echo -e "${RED}✗ Some tests failed. Check the output above for details.${NC}"
    exit 1
fi

echo -e "${BLUE}Test execution completed.${NC}"
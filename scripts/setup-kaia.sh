#!/bin/bash

# 🌊 KaiaSIP Setup Script
# This script sets up the development environment for Kaia

echo "🌊 Setting up KaiaSIP for Kaia Network..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install Node.js which includes npm.${NC}"
    exit 1
fi

echo -e "${BLUE}📦 Installing dependencies...${NC}"

# Install root dependencies
npm install

# Install frontend dependencies
cd sip-agent
npm install
cd ..

echo -e "${GREEN}✅ Dependencies installed successfully!${NC}"

# Copy environment file
if [ ! -f .env ]; then
    echo -e "${BLUE}📝 Setting up environment configuration...${NC}"
    cp .env.kaia.example .env
    echo -e "${YELLOW}⚠️ Please update .env file with your actual values${NC}"
fi

# Create deployments directory
mkdir -p deployments

# Compile contracts
echo -e "${BLUE}🔨 Compiling smart contracts...${NC}"
npx hardhat compile

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Smart contracts compiled successfully!${NC}"
else
    echo -e "${RED}❌ Smart contract compilation failed${NC}"
    exit 1
fi

# Create necessary directories
mkdir -p test
mkdir -p cache
mkdir -p artifacts

echo -e "${GREEN}🎉 Setup complete!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Update .env file with your private key and API keys"
echo "2. Get Kaia testnet tokens from: https://kairos.wallet.kaia.io/faucet"
echo "3. Deploy to Kaia testnet: npm run deploy:kaia-testnet"
echo "4. Start development: npm run dev"
echo ""
echo -e "${YELLOW}📚 Documentation:${NC}"
echo "- Kaia Network: https://docs.kaia.io"
echo "- Kaia Wallet: https://wallet.kaia.io"
echo "- KaiaScan Explorer: https://kaiascan.io"
echo ""
echo -e "${GREEN}🚀 Ready to build on Kaia!${NC}"
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // Kaia Mainnet
    kaia: {
      url: "https://public-en.node.kaia.io",
      chainId: 8217,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 25000000000, // 25 Gwei
    },
    // Kaia Testnet (Kairos)
    kairos: {
      url: "https://public-en-kairos.node.kaia.io", 
      chainId: 1001,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 25000000000, // 25 Gwei
    },
    // Local development
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    // Keep Avalanche networks for comparison/migration
    fuji: {
      url: "https://api.avax-test.network/ext/bc/C/rpc",
      chainId: 43113,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    avalanche: {
      url: "https://api.avax.network/ext/bc/C/rpc",
      chainId: 43114,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    }
  },
  etherscan: {
    apiKey: {
      // Kaia block explorer API keys
      kaia: process.env.KAIASCAN_API_KEY || "dummy",
      kairos: process.env.KAIASCAN_API_KEY || "dummy",
      // Keep Avalanche for reference
      avalanche: process.env.SNOWTRACE_API_KEY || "dummy",
      avalancheFujiTestnet: process.env.SNOWTRACE_API_KEY || "dummy",
    },
    customChains: [
      {
        network: "kaia",
        chainId: 8217,
        urls: {
          apiURL: "https://api.kaiascan.io/api",
          browserURL: "https://kaiascan.io"
        }
      },
      {
        network: "kairos", 
        chainId: 1001,
        urls: {
          apiURL: "https://api-kairos.kaiascan.io/api",
          browserURL: "https://kairos.kaiascan.io"
        }
      }
    ]
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 60000
  }
};
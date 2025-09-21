// Kaia Network Configuration
export const KAIA_CONFIG = {
  // Network Details
  MAINNET: {
    chainId: 8217,
    name: 'Kaia Mainnet',
    rpcUrl: 'https://public-en.node.kaia.io',
    blockExplorer: 'https://kaiascan.io',
    currency: {
      name: 'KAIA',
      symbol: 'KAIA',
      decimals: 18
    }
  },
  
  TESTNET: {
    chainId: 1001,
    name: 'Kaia Testnet Kairos',
    rpcUrl: 'https://public-en-kairos.node.kaia.io',
    blockExplorer: 'https://kairos.kaiascan.io',
    currency: {
      name: 'KAIA',
      symbol: 'KAIA', 
      decimals: 18
    },
    faucet: 'https://kairos.wallet.kaia.io/faucet'
  }
};

// Contract Addresses (will be updated after deployment)
export const KAIA_CONTRACTS = {
  MAINNET: {
    SIP_MANAGER: '0x0000000000000000000000000000000000000000',
    SIP_TOKEN: '0x0000000000000000000000000000000000000000',
    USDT_VAULT: '0x0000000000000000000000000000000000000000',
    USDC_VAULT: '0x0000000000000000000000000000000000000000',
    DAI_VAULT: '0x0000000000000000000000000000000000000000',
    CROSS_CHAIN_BRIDGE: '0x0000000000000000000000000000000000000000',
    // Kaia native stablecoins
    KAIA_USDT: '0x0000000000000000000000000000000000000001',
    KAIA_USDC: '0x0000000000000000000000000000000000000002',
    KAIA_DAI: '0x0000000000000000000000000000000000000003'
  },
  
  TESTNET: {
    SIP_MANAGER: '0x0000000000000000000000000000000000000000',
    SIP_TOKEN: '0x0000000000000000000000000000000000000000', 
    USDT_VAULT: '0x0000000000000000000000000000000000000000',
    USDC_VAULT: '0x0000000000000000000000000000000000000000',
    DAI_VAULT: '0x0000000000000000000000000000000000000000',
    CROSS_CHAIN_BRIDGE: '0x0000000000000000000000000000000000000000',
    // Testnet stablecoins
    KAIA_USDT: '0x0000000000000000000000000000000000000001',
    KAIA_USDC: '0x0000000000000000000000000000000000000002', 
    KAIA_DAI: '0x0000000000000000000000000000000000000003'
  }
};

// Supported Stablecoins
export const SUPPORTED_STABLECOINS = [
  {
    symbol: 'USDT',
    name: 'Kaia USDT',
    decimals: 6,
    icon: '💵',
    color: '#26A17B'
  },
  {
    symbol: 'USDC', 
    name: 'Kaia USDC',
    decimals: 6,
    icon: '🔵',
    color: '#2775CA'
  },
  {
    symbol: 'DAI',
    name: 'Kaia DAI', 
    decimals: 18,
    icon: '🟡',
    color: '#F5AC37'
  }
];

// Yield Vaults Configuration
export const YIELD_VAULTS = [
  {
    id: 0,
    name: 'Conservative USDT Vault',
    token: 'USDT',
    apy: 5.2,
    riskScore: 3,
    description: 'Low-risk stablecoin farming with consistent returns',
    color: '#10B981',
    icon: '🛡️'
  },
  {
    id: 1, 
    name: 'Moderate USDC Vault',
    token: 'USDC',
    apy: 7.8,
    riskScore: 5,
    description: 'Balanced risk-reward with moderate yield strategies',
    color: '#3B82F6',
    icon: '⚖️'
  },
  {
    id: 2,
    name: 'Aggressive DAI Vault', 
    token: 'DAI',
    apy: 10.5,
    riskScore: 7,
    description: 'High-yield DeFi strategies for risk-tolerant investors',
    color: '#EF4444',
    icon: '🚀'
  }
];

// Cross-Chain Bridge Configuration
export const BRIDGE_CONFIG = {
  SUPPORTED_CHAINS: [
    {
      name: 'Ethereum',
      chainId: 1,
      symbol: 'ETH',
      icon: '⟠',
      bridgeFee: 0.3, // 0.3%
      estimatedTime: '10-15 minutes'
    },
    {
      name: 'Polygon',
      chainId: 137, 
      symbol: 'MATIC',
      icon: '🟣',
      bridgeFee: 0.2, // 0.2%
      estimatedTime: '5-10 minutes'
    },
    {
      name: 'BSC',
      chainId: 56,
      symbol: 'BNB', 
      icon: '🟡',
      bridgeFee: 0.25, // 0.25%
      estimatedTime: '3-5 minutes'
    },
    {
      name: 'Arbitrum',
      chainId: 42161,
      symbol: 'ETH',
      icon: '🔵',
      bridgeFee: 0.2, // 0.2%
      estimatedTime: '5-10 minutes'
    },
    {
      name: 'Optimism',
      chainId: 10,
      symbol: 'ETH', 
      icon: '🔴',
      bridgeFee: 0.2, // 0.2%
      estimatedTime: '5-10 minutes'
    }
  ]
};

// AI Risk Assessment Configuration
export const AI_CONFIG = {
  RISK_LEVELS: [
    { level: 1, label: 'Very Conservative', color: '#10B981', description: 'Capital preservation focused' },
    { level: 2, label: 'Conservative', color: '#059669', description: 'Low risk, steady returns' },
    { level: 3, label: 'Moderate Conservative', color: '#34D399', description: 'Slight risk for better returns' },
    { level: 4, label: 'Moderate', color: '#60A5FA', description: 'Balanced risk-reward approach' },
    { level: 5, label: 'Balanced', color: '#3B82F6', description: 'Equal risk and growth focus' },
    { level: 6, label: 'Moderate Aggressive', color: '#8B5CF6', description: 'Growth-oriented with some risk' },
    { level: 7, label: 'Aggressive', color: '#A855F7', description: 'High growth potential, higher risk' },
    { level: 8, label: 'Very Aggressive', color: '#EC4899', description: 'Maximum growth, significant risk' },
    { level: 9, label: 'Speculative', color: '#EF4444', description: 'High-risk, high-reward strategies' },
    { level: 10, label: 'Extreme', color: '#DC2626', description: 'Maximum risk for maximum returns' }
  ],
  
  YIELD_EXPLANATIONS: {
    LOW: 'This strategy focuses on capital preservation with minimal risk. Returns are steady but modest.',
    MEDIUM: 'Balanced approach combining safety with growth. Moderate risk for enhanced returns.',
    HIGH: 'Growth-focused strategy with higher risk tolerance. Potential for significant returns with volatility.'
  }
};

// Kaia Wallet Integration
export const WALLET_CONFIG = {
  KAIA_WALLET: {
    name: 'Kaia Wallet',
    icon: '🌊',
    downloadUrl: 'https://wallet.kaia.io',
    deepLink: 'kaiawallet://',
    supported: true
  },
  
  METAMASK: {
    name: 'MetaMask',
    icon: '🦊', 
    downloadUrl: 'https://metamask.io',
    supported: true
  },
  
  WEB3AUTH: {
    name: 'Web3Auth',
    icon: '🔐',
    socialLogins: ['google', 'facebook', 'twitter', 'discord'],
    supported: true
  }
};

// Gas Optimization for Kaia
export const GAS_CONFIG = {
  STANDARD: {
    gasPrice: '25000000000', // 25 Gwei
    gasLimit: '300000'
  },
  
  FAST: {
    gasPrice: '30000000000', // 30 Gwei  
    gasLimit: '300000'
  },
  
  INSTANT: {
    gasPrice: '35000000000', // 35 Gwei
    gasLimit: '300000'
  }
};

// Development vs Production
export const getKaiaConfig = () => {
  const isDev = process.env.NODE_ENV === 'development';
  return isDev ? KAIA_CONFIG.TESTNET : KAIA_CONFIG.MAINNET;
};

export const getKaiaContracts = () => {
  const isDev = process.env.NODE_ENV === 'development';
  return isDev ? KAIA_CONTRACTS.TESTNET : KAIA_CONTRACTS.MAINNET;
};
import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { KAIA_CONFIG, WALLET_CONFIG, getKaiaConfig } from '../config/kaia';

interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  chainId: number | null;
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
}

interface KaiaWalletHook {
  wallet: WalletState;
  connectWallet: (walletType?: 'metamask' | 'kaia' | 'web3auth') => Promise<void>;
  disconnectWallet: () => void;
  switchToKaia: () => Promise<void>;
  isKaiaNetwork: boolean;
  loading: boolean;
  error: string | null;
}

export const useKaiaWallet = (): KaiaWalletHook => {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: null,
    chainId: null,
    provider: null,
    signer: null
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const kaiaConfig = getKaiaConfig();
  const isKaiaNetwork = wallet.chainId === kaiaConfig.chainId;

  // Check if wallet is already connected
  useEffect(() => {
    checkConnection();
    
    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const checkConnection = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          await updateWalletState(provider);
        }
      }
    } catch (err) {
      console.error('Error checking wallet connection:', err);
    }
  };

  const updateWalletState = async (provider: ethers.providers.Web3Provider) => {
    try {
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const balance = await provider.getBalance(address);
      const network = await provider.getNetwork();
      
      setWallet({
        isConnected: true,
        address,
        balance: ethers.utils.formatEther(balance),
        chainId: network.chainId,
        provider,
        signer
      });
      
      setError(null);
    } catch (err) {
      console.error('Error updating wallet state:', err);
      setError('Failed to update wallet state');
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      checkConnection();
    }
  };

  const handleChainChanged = () => {
    // Reload the page when chain changes to avoid stale state
    window.location.reload();
  };

  const connectWallet = useCallback(async (walletType: 'metamask' | 'kaia' | 'web3auth' = 'metamask') => {
    setLoading(true);
    setError(null);
    
    try {
      if (walletType === 'web3auth') {
        await connectWeb3Auth();
      } else if (walletType === 'kaia') {
        await connectKaiaWallet();
      } else {
        await connectMetaMask();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
      console.error('Wallet connection error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const connectMetaMask = async () => {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed. Please install MetaMask to continue.');
    }

    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await updateWalletState(provider);
      
      // Auto-switch to Kaia if not already connected
      if (!isKaiaNetwork) {
        await switchToKaia();
      }
    } catch (err: any) {
      if (err.code === 4001) {
        throw new Error('Please connect to MetaMask');
      }
      throw err;
    }
  };

  const connectKaiaWallet = async () => {
    // Check if Kaia Wallet is available
    if (window.kaia) {
      try {
        await window.kaia.enable();
        const provider = new ethers.providers.Web3Provider(window.kaia);
        await updateWalletState(provider);
      } catch (err) {
        throw new Error('Failed to connect to Kaia Wallet');
      }
    } else {
      // Redirect to Kaia Wallet download or deep link
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        window.location.href = WALLET_CONFIG.KAIA_WALLET.deepLink;
      } else {
        window.open(WALLET_CONFIG.KAIA_WALLET.downloadUrl, '_blank');
        throw new Error('Kaia Wallet not found. Please install Kaia Wallet.');
      }
    }
  };

  const connectWeb3Auth = async () => {
    // Web3Auth integration would go here
    // This is a placeholder for the actual Web3Auth SDK integration
    try {
      // Initialize Web3Auth
      // const web3auth = new Web3Auth({ ... });
      // await web3auth.initModal();
      // const provider = await web3auth.connect();
      
      throw new Error('Web3Auth integration coming soon!');
    } catch (err) {
      throw new Error('Failed to connect with Web3Auth');
    }
  };

  const switchToKaia = useCallback(async () => {
    if (!window.ethereum) {
      throw new Error('No wallet found');
    }

    try {
      // Try to switch to Kaia network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${kaiaConfig.chainId.toString(16)}` }],
      });
    } catch (switchError: any) {
      // If network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${kaiaConfig.chainId.toString(16)}`,
                chainName: kaiaConfig.name,
                nativeCurrency: kaiaConfig.currency,
                rpcUrls: [kaiaConfig.rpcUrl],
                blockExplorerUrls: [kaiaConfig.blockExplorer],
              },
            ],
          });
        } catch (addError) {
          throw new Error('Failed to add Kaia network to wallet');
        }
      } else {
        throw new Error('Failed to switch to Kaia network');
      }
    }
  }, [kaiaConfig]);

  const disconnectWallet = useCallback(() => {
    setWallet({
      isConnected: false,
      address: null,
      balance: null,
      chainId: null,
      provider: null,
      signer: null
    });
    setError(null);
  }, []);

  return {
    wallet,
    connectWallet,
    disconnectWallet,
    switchToKaia,
    isKaiaNetwork,
    loading,
    error
  };
};

// Extend Window interface for wallet providers
declare global {
  interface Window {
    ethereum?: any;
    kaia?: any;
  }
}
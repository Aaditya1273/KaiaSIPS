import React, { useState } from 'react';
import { useKaiaWallet } from '../hooks/useKaiaWallet';
import { WALLET_CONFIG } from '../config/kaia';

interface WalletConnectProps {
  onConnect?: () => void;
}

export const KaiaWalletConnect: React.FC<WalletConnectProps> = ({ onConnect }) => {
  const { wallet, connectWallet, disconnectWallet, switchToKaia, isKaiaNetwork, loading, error } = useKaiaWallet();
  const [showWalletOptions, setShowWalletOptions] = useState(false);

  const handleConnect = async (walletType: 'metamask' | 'kaia' | 'web3auth') => {
    try {
      await connectWallet(walletType);
      setShowWalletOptions(false);
      onConnect?.();
    } catch (err) {
      console.error('Connection failed:', err);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: string) => {
    return `${parseFloat(balance).toFixed(4)} KAIA`;
  };

  if (wallet.isConnected) {
    return (
      <div className="flex items-center space-x-4">
        {/* Network Status */}
        <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
          isKaiaNetwork ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            isKaiaNetwork ? 'bg-green-500' : 'bg-red-500'
          }`} />
          <span className="text-sm font-medium">
            {isKaiaNetwork ? 'Kaia Network' : 'Wrong Network'}
          </span>
        </div>

        {/* Switch Network Button */}
        {!isKaiaNetwork && (
          <button
            onClick={switchToKaia}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Switch to Kaia
          </button>
        )}

        {/* Wallet Info */}
        <div className="flex items-center space-x-3 bg-gray-100 rounded-lg px-4 py-2">
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">
              {formatAddress(wallet.address!)}
            </div>
            <div className="text-xs text-gray-500">
              {wallet.balance && formatBalance(wallet.balance)}
            </div>
          </div>
          
          <button
            onClick={disconnectWallet}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            title="Disconnect Wallet"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Connect Button */}
      <button
        onClick={() => setShowWalletOptions(true)}
        disabled={loading}
        className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <span>🌊</span>
            <span>Connect Wallet</span>
          </>
        )}
      </button>

      {/* Wallet Options Modal */}
      {showWalletOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Connect Wallet</h3>
              <button
                onClick={() => setShowWalletOptions(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              {/* Kaia Wallet */}
              <button
                onClick={() => handleConnect('kaia')}
                className="w-full flex items-center space-x-4 p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all"
              >
                <span className="text-2xl">{WALLET_CONFIG.KAIA_WALLET.icon}</span>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">{WALLET_CONFIG.KAIA_WALLET.name}</div>
                  <div className="text-sm text-gray-500">Native Kaia wallet</div>
                </div>
                <div className="ml-auto">
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Recommended</span>
                </div>
              </button>

              {/* MetaMask */}
              <button
                onClick={() => handleConnect('metamask')}
                className="w-full flex items-center space-x-4 p-4 border-2 border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-all"
              >
                <span className="text-2xl">{WALLET_CONFIG.METAMASK.icon}</span>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">{WALLET_CONFIG.METAMASK.name}</div>
                  <div className="text-sm text-gray-500">Popular browser wallet</div>
                </div>
              </button>

              {/* Web3Auth */}
              <button
                onClick={() => handleConnect('web3auth')}
                className="w-full flex items-center space-x-4 p-4 border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all"
              >
                <span className="text-2xl">{WALLET_CONFIG.WEB3AUTH.icon}</span>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">{WALLET_CONFIG.WEB3AUTH.name}</div>
                  <div className="text-sm text-gray-500">Social login (Google, Twitter, etc.)</div>
                </div>
                <div className="ml-auto">
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">Easy</span>
                </div>
              </button>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-red-500">⚠️</span>
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              </div>
            )}

            {/* Help Text */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                New to crypto wallets?{' '}
                <a 
                  href="https://wallet.kaia.io/guide" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Learn more
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
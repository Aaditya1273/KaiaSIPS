import React, { useState, useEffect } from 'react';
import { useKaiaWallet } from '../hooks/useKaiaWallet';
import { KaiaWalletConnect } from './KaiaWalletConnect';
import { AIRiskAssessment } from './AIRiskAssessment';
import { SUPPORTED_STABLECOINS, YIELD_VAULTS, getKaiaContracts } from '../config/kaia';
import { ethers } from 'ethers';

interface SIPData {
  monthlyAmount: string;
  totalTarget: string;
  totalDeposited: string;
  percentComplete: number;
  nextDepositTime: number;
  isActive: boolean;
  automationEnabled: boolean;
  goal: string;
  preferredToken: string;
  riskTolerance: number;
}

export const KaiaSIPDashboard: React.FC = () => {
  const { wallet, isKaiaNetwork } = useKaiaWallet();
  const [sipData, setSipData] = useState<SIPData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreateSIP, setShowCreateSIP] = useState(false);
  const [userRiskLevel, setUserRiskLevel] = useState(5);
  
  // Create SIP form state
  const [createForm, setCreateForm] = useState({
    monthlyAmount: '',
    totalTarget: '',
    intervalDays: '30',
    goal: '',
    preferredToken: SUPPORTED_STABLECOINS[0].symbol,
    riskTolerance: 5
  });

  useEffect(() => {
    if (wallet.isConnected && isKaiaNetwork) {
      loadSIPData();
    }
  }, [wallet.isConnected, isKaiaNetwork]);

  const loadSIPData = async () => {
    if (!wallet.signer) return;
    
    setLoading(true);
    try {
      // In production, this would call the actual contract
      // const contract = new ethers.Contract(contractAddress, abi, wallet.signer);
      // const sipProgress = await contract.getSIPProgress(wallet.address);
      
      // Mock data for demo
      const mockSIPData: SIPData = {
        monthlyAmount: '100',
        totalTarget: '1200',
        totalDeposited: '300',
        percentComplete: 25,
        nextDepositTime: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
        isActive: true,
        automationEnabled: true,
        goal: 'Emergency Fund',
        preferredToken: 'USDT',
        riskTolerance: 5
      };
      
      setSipData(mockSIPData);
    } catch (error) {
      console.error('Error loading SIP data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSIP = async () => {
    if (!wallet.signer) return;
    
    setLoading(true);
    try {
      // In production, this would call the actual contract
      // const contract = new ethers.Contract(contractAddress, abi, wallet.signer);
      // const tx = await contract.createSIP(...);
      // await tx.wait();
      
      // Mock success
      setTimeout(() => {
        setShowCreateSIP(false);
        loadSIPData();
        setLoading(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error creating SIP:', error);
      setLoading(false);
    }
  };

  const formatTimeUntilNext = (timestamp: number) => {
    const now = Date.now();
    const diff = timestamp - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const getTokenIcon = (symbol: string) => {
    const token = SUPPORTED_STABLECOINS.find(t => t.symbol === symbol);
    return token?.icon || '💰';
  };

  const getRecommendedVault = (riskLevel: number) => {
    return YIELD_VAULTS.find(vault => Math.abs(vault.riskScore - riskLevel) <= 1) || YIELD_VAULTS[0];
  };

  if (!wallet.isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🌊 KaiaSIP
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              AI-Powered DeFi Investment Platform on Kaia
            </p>
          </div>
          <KaiaWalletConnect />
        </div>
      </div>
    );
  }

  if (!isKaiaNetwork) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-900 mb-4">Wrong Network</h2>
          <p className="text-red-700 mb-6">Please switch to Kaia network to continue</p>
          <KaiaWalletConnect />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                🌊 KaiaSIP
              </h1>
              <span className="ml-3 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Kaia Network
              </span>
            </div>
            <KaiaWalletConnect />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main SIP Dashboard */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* SIP Overview */}
            {sipData ? (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Your SIP Plan</h2>
                  <div className="flex items-center space-x-2">
                    <span className={`w-3 h-3 rounded-full ${sipData.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="text-sm text-gray-600">
                      {sipData.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress: {sipData.percentComplete}%</span>
                    <span>{sipData.totalDeposited} / {sipData.totalTarget} USDT</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${sipData.percentComplete}%` }}
                    ></div>
                  </div>
                </div>

                {/* SIP Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl mb-1">{getTokenIcon(sipData.preferredToken)}</div>
                    <div className="text-sm text-gray-500">Monthly</div>
                    <div className="font-semibold">{sipData.monthlyAmount} {sipData.preferredToken}</div>
                  </div>
                  
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl mb-1">🎯</div>
                    <div className="text-sm text-gray-500">Goal</div>
                    <div className="font-semibold">{sipData.goal}</div>
                  </div>
                  
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl mb-1">⏰</div>
                    <div className="text-sm text-gray-500">Next Deposit</div>
                    <div className="font-semibold">{formatTimeUntilNext(sipData.nextDepositTime)}</div>
                  </div>
                  
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl mb-1">📊</div>
                    <div className="text-sm text-gray-500">Risk Level</div>
                    <div className="font-semibold">{sipData.riskTolerance}/10</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                    💰 Make Deposit
                  </button>
                  <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                    📈 View Yields
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    ⚙️ Settings
                  </button>
                </div>
              </div>
            ) : (
              /* Create SIP Card */
              <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                <div className="text-6xl mb-4">🌊</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Start Your AI-Powered SIP
                </h2>
                <p className="text-gray-600 mb-6">
                  Create systematic investment plans with AI optimization and cross-chain stablecoin support
                </p>
                <button
                  onClick={() => setShowCreateSIP(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  🚀 Create SIP Plan
                </button>
              </div>
            )}

            {/* Yield Vaults */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Available Yield Vaults</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {YIELD_VAULTS.map((vault) => (
                  <div key={vault.id} className="border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl">{vault.icon}</span>
                      <span className="text-sm font-medium text-gray-500">Risk: {vault.riskScore}/10</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">{vault.name}</h4>
                    <div className="text-2xl font-bold text-green-600 mb-2">{vault.apy}%</div>
                    <p className="text-sm text-gray-600 mb-4">{vault.description}</p>
                    <button className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Risk Assessment */}
            {wallet.address && (
              <AIRiskAssessment
                userAddress={wallet.address}
                onRiskUpdate={(risk, explanation) => {
                  setUserRiskLevel(risk);
                  console.log('Risk updated:', risk, explanation);
                }}
              />
            )}

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Platform Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Value Locked</span>
                  <span className="font-semibold">$2.4M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active SIPs</span>
                  <span className="font-semibold">1,247</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average APY</span>
                  <span className="font-semibold text-green-600">7.8%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="font-semibold text-blue-600">94.2%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create SIP Modal */}
      {showCreateSIP && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Create SIP Plan</h3>
              <button
                onClick={() => setShowCreateSIP(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); createSIP(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Amount</label>
                <input
                  type="number"
                  value={createForm.monthlyAmount}
                  onChange={(e) => setCreateForm({...createForm, monthlyAmount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Target</label>
                <input
                  type="number"
                  value={createForm.totalTarget}
                  onChange={(e) => setCreateForm({...createForm, totalTarget: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Token</label>
                <select
                  value={createForm.preferredToken}
                  onChange={(e) => setCreateForm({...createForm, preferredToken: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {SUPPORTED_STABLECOINS.map(token => (
                    <option key={token.symbol} value={token.symbol}>
                      {token.icon} {token.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Investment Goal</label>
                <input
                  type="text"
                  value={createForm.goal}
                  onChange={(e) => setCreateForm({...createForm, goal: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Emergency Fund, Retirement, etc."
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateSIP(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create SIP'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
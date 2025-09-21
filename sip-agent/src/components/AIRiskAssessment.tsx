import React, { useState, useEffect } from 'react';
import { AI_CONFIG, YIELD_VAULTS } from '../config/kaia';

interface RiskAssessmentProps {
  userAddress: string;
  onRiskUpdate: (riskLevel: number, explanation: string) => void;
}

interface RiskMetrics {
  overallRisk: number;
  expectedYield: number;
  explanation: string;
  recommendations: string[];
  marketConditions: 'bullish' | 'bearish' | 'neutral';
  volatilityScore: number;
}

export const AIRiskAssessment: React.FC<RiskAssessmentProps> = ({ userAddress, onRiskUpdate }) => {
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedRiskLevel, setSelectedRiskLevel] = useState(5);
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);

  useEffect(() => {
    if (userAddress) {
      generateRiskAssessment();
    }
  }, [userAddress, selectedRiskLevel]);

  const generateRiskAssessment = async () => {
    setLoading(true);
    
    // Simulate AI risk assessment (in production, this would call your AI service)
    setTimeout(() => {
      const mockAssessment = generateMockAssessment(selectedRiskLevel);
      setRiskMetrics(mockAssessment);
      onRiskUpdate(mockAssessment.overallRisk, mockAssessment.explanation);
      setLoading(false);
    }, 1500);
  };

  const generateMockAssessment = (riskLevel: number): RiskMetrics => {
    const baseYield = 3.5;
    const riskMultiplier = riskLevel * 0.8;
    const expectedYield = baseYield + riskMultiplier;
    
    const marketConditions: ('bullish' | 'bearish' | 'neutral')[] = ['bullish', 'neutral', 'bearish'];
    const randomMarket = marketConditions[Math.floor(Math.random() * marketConditions.length)];
    
    const volatilityScore = Math.min(riskLevel * 1.2 + Math.random() * 2, 10);
    
    let explanation = '';
    let recommendations: string[] = [];
    
    if (riskLevel <= 3) {
      explanation = `Conservative approach detected. Your risk tolerance suggests prioritizing capital preservation with steady, predictable returns. Current market conditions are ${randomMarket}, which aligns well with low-risk strategies.`;
      recommendations = [
        'Focus on stablecoin farming with established protocols',
        'Consider dollar-cost averaging for consistent exposure',
        'Maintain emergency fund outside of DeFi investments',
        'Monitor yield rates but avoid chasing high APY'
      ];
    } else if (riskLevel <= 6) {
      explanation = `Balanced risk profile identified. You're comfortable with moderate volatility for enhanced returns. The ${randomMarket} market sentiment provides opportunities for diversified yield strategies.`;
      recommendations = [
        'Diversify across multiple yield vaults',
        'Consider automated rebalancing strategies',
        'Monitor protocol health and TVL changes',
        'Set stop-loss levels for risk management'
      ];
    } else {
      explanation = `Aggressive growth strategy detected. High risk tolerance allows for maximum yield optimization. Current ${randomMarket} conditions may amplify both gains and potential losses.`;
      recommendations = [
        'Leverage advanced DeFi strategies carefully',
        'Monitor impermanent loss in liquidity pools',
        'Stay updated on protocol governance changes',
        'Consider taking profits during high-yield periods'
      ];
    }
    
    return {
      overallRisk: riskLevel,
      expectedYield,
      explanation,
      recommendations,
      marketConditions: randomMarket,
      volatilityScore
    };
  };

  const getRiskColor = (risk: number) => {
    if (risk <= 3) return 'text-green-600 bg-green-100';
    if (risk <= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getMarketIcon = (condition: string) => {
    switch (condition) {
      case 'bullish': return '📈';
      case 'bearish': return '📉';
      default: return '➡️';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <span className="mr-2">🤖</span>
          AI Risk Assessment
        </h3>
        <button
          onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          {showDetailedAnalysis ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      {/* Risk Level Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Your Risk Tolerance (1-10)
        </label>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Conservative</span>
          <input
            type="range"
            min="1"
            max="10"
            value={selectedRiskLevel}
            onChange={(e) => setSelectedRiskLevel(parseInt(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #10B981 0%, #F59E0B 50%, #EF4444 100%)`
            }}
          />
          <span className="text-sm text-gray-500">Aggressive</span>
        </div>
        <div className="mt-2 text-center">
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(selectedRiskLevel)}`}>
            Level {selectedRiskLevel}: {AI_CONFIG.RISK_LEVELS[selectedRiskLevel - 1]?.label}
          </span>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Analyzing market conditions...</span>
        </div>
      )}

      {/* Risk Assessment Results */}
      {riskMetrics && !loading && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500">Expected Yield</div>
              <div className="text-2xl font-bold text-green-600">
                {riskMetrics.expectedYield.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-400">Annual APY</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500">Market Sentiment</div>
              <div className="text-2xl font-bold flex items-center">
                <span className="mr-2">{getMarketIcon(riskMetrics.marketConditions)}</span>
                <span className="capitalize">{riskMetrics.marketConditions}</span>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500">Volatility Score</div>
              <div className="text-2xl font-bold text-purple-600">
                {riskMetrics.volatilityScore.toFixed(1)}/10
              </div>
            </div>
          </div>

          {/* AI Explanation */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">AI Analysis</h4>
            <p className="text-blue-800 text-sm leading-relaxed">
              {riskMetrics.explanation}
            </p>
          </div>

          {/* Recommended Vaults */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Recommended Vaults</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {YIELD_VAULTS.map((vault) => {
                const isRecommended = Math.abs(vault.riskScore - selectedRiskLevel) <= 2;
                return (
                  <div
                    key={vault.id}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      isRecommended 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-gray-200 bg-gray-50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg">{vault.icon}</span>
                      {isRecommended && <span className="text-green-600 text-xs">✓ Match</span>}
                    </div>
                    <div className="text-sm font-medium text-gray-900">{vault.name}</div>
                    <div className="text-xs text-gray-500">{vault.apy}% APY</div>
                    <div className="text-xs text-gray-400">Risk: {vault.riskScore}/10</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Analysis */}
          {showDetailedAnalysis && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">AI Recommendations</h4>
              <ul className="space-y-2">
                {riskMetrics.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={generateRiskAssessment}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔄 Refresh Analysis
            </button>
            <button
              onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              📊 {showDetailedAnalysis ? 'Simple View' : 'Detailed View'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
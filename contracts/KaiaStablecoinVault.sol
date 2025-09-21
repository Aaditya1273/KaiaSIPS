// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title KaiaStablecoinVault
 * @dev High-yield stablecoin vault optimized for Kaia network
 */
contract KaiaStablecoinVault is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable stablecoin;
    string public vaultName;
    uint256 public currentAPY;
    uint8 public riskScore;
    
    uint256 public totalDeposits;
    uint256 public totalShares;
    uint256 public lastYieldUpdate;
    uint256 public yieldAccumulated;
    
    mapping(address => uint256) public userShares;
    mapping(address => uint256) public lastClaimTime;
    
    // AI yield optimization
    address public aiYieldOptimizer;
    uint256 public baseYieldRate = 520; // 5.2% base APY
    uint256 public maxYieldRate = 1200; // 12% max APY
    
    event Deposit(address indexed user, uint256 amount, uint256 shares);
    event Withdraw(address indexed user, uint256 amount, uint256 shares);
    event YieldClaimed(address indexed user, uint256 amount);
    event YieldRateUpdated(uint256 newRate);
    event AIOptimizationExecuted(string strategy);

    constructor(
        address _stablecoin,
        string memory _vaultName,
        uint256 _initialAPY,
        uint8 _riskScore
    ) Ownable(msg.sender) {
        stablecoin = IERC20(_stablecoin);
        vaultName = _vaultName;
        currentAPY = _initialAPY;
        riskScore = _riskScore;
        lastYieldUpdate = block.timestamp;
    }

    function setAIYieldOptimizer(address _aiOptimizer) external onlyOwner {
        aiYieldOptimizer = _aiOptimizer;
    }

    // === DEPOSIT FUNCTIONS ===
    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        
        updateYield();
        
        uint256 shares = totalShares == 0 ? amount : (amount * totalShares) / totalDeposits;
        
        stablecoin.safeTransferFrom(msg.sender, address(this), amount);
        
        userShares[msg.sender] += shares;
        totalShares += shares;
        totalDeposits += amount;
        lastClaimTime[msg.sender] = block.timestamp;
        
        emit Deposit(msg.sender, amount, shares);
    }

    // === WITHDRAW FUNCTIONS ===
    function withdraw(uint256 shares) external nonReentrant {
        require(shares > 0, "Shares must be > 0");
        require(userShares[msg.sender] >= shares, "Insufficient shares");
        
        updateYield();
        
        uint256 amount = (shares * totalDeposits) / totalShares;
        
        userShares[msg.sender] -= shares;
        totalShares -= shares;
        totalDeposits -= amount;
        
        stablecoin.safeTransfer(msg.sender, amount);
        
        emit Withdraw(msg.sender, amount, shares);
    }

    function withdrawAll() external {
        uint256 userShareBalance = userShares[msg.sender];
        if (userShareBalance > 0) {
            withdraw(userShareBalance);
        }
    }

    // === YIELD FUNCTIONS ===
    function updateYield() public {
        if (totalDeposits == 0) return;
        
        uint256 timeElapsed = block.timestamp - lastYieldUpdate;
        if (timeElapsed == 0) return;
        
        uint256 yieldGenerated = (totalDeposits * currentAPY * timeElapsed) / (10000 * 365 days);
        yieldAccumulated += yieldGenerated;
        lastYieldUpdate = block.timestamp;
    }

    function claimYield() external nonReentrant {
        updateYield();
        
        uint256 userYield = calculateUserYield(msg.sender);
        require(userYield > 0, "No yield to claim");
        
        lastClaimTime[msg.sender] = block.timestamp;
        
        // Mint yield or transfer from yield pool
        stablecoin.safeTransfer(msg.sender, userYield);
        
        emit YieldClaimed(msg.sender, userYield);
    }

    function calculateUserYield(address user) public view returns (uint256) {
        if (userShares[user] == 0 || totalShares == 0) return 0;
        
        uint256 timeElapsed = block.timestamp - lastClaimTime[user];
        uint256 userPortion = (userShares[user] * 1e18) / totalShares;
        uint256 userDeposits = (totalDeposits * userPortion) / 1e18;
        
        return (userDeposits * currentAPY * timeElapsed) / (10000 * 365 days);
    }

    // === AI OPTIMIZATION ===
    function aiOptimizeYield(uint256 newAPY, string memory strategy) external {
        require(msg.sender == aiYieldOptimizer, "Only AI optimizer");
        require(newAPY >= baseYieldRate && newAPY <= maxYieldRate, "APY out of range");
        
        updateYield();
        currentAPY = newAPY;
        
        emit YieldRateUpdated(newAPY);
        emit AIOptimizationExecuted(strategy);
    }

    function aiRebalancePortfolio() external {
        require(msg.sender == aiYieldOptimizer, "Only AI optimizer");
        
        // AI can trigger rebalancing logic here
        updateYield();
        
        emit AIOptimizationExecuted("portfolio_rebalanced");
    }

    // === VIEW FUNCTIONS ===
    function getUserBalance(address user) external view returns (uint256) {
        if (totalShares == 0) return 0;
        return (userShares[user] * totalDeposits) / totalShares;
    }

    function getUserShares(address user) external view returns (uint256) {
        return userShares[user];
    }

    function getVaultInfo() external view returns (
        string memory name,
        uint256 apy,
        uint8 risk,
        uint256 tvl,
        uint256 totalSharesIssued
    ) {
        return (vaultName, currentAPY, riskScore, totalDeposits, totalShares);
    }

    function getExpectedYield(address user) external view returns (uint256) {
        return calculateUserYield(user);
    }

    // === ADMIN FUNCTIONS ===
    function updateVaultParameters(
        uint256 newAPY,
        uint8 newRiskScore,
        string memory newName
    ) external onlyOwner {
        require(newAPY >= baseYieldRate && newAPY <= maxYieldRate, "APY out of range");
        require(newRiskScore >= 1 && newRiskScore <= 10, "Risk score 1-10");
        
        updateYield();
        currentAPY = newAPY;
        riskScore = newRiskScore;
        vaultName = newName;
        
        emit YieldRateUpdated(newAPY);
    }

    function emergencyWithdraw(uint256 amount) external onlyOwner {
        stablecoin.safeTransfer(owner(), amount);
    }

    function addYieldRewards(uint256 amount) external onlyOwner {
        stablecoin.safeTransferFrom(msg.sender, address(this), amount);
        yieldAccumulated += amount;
    }
}
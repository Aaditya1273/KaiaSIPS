// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";

/**
 * @title KaiaSIPManager
 * @dev AI-powered SIP management on Kaia blockchain with cross-chain stablecoin support
 */
contract KaiaSIPManager is Ownable, ReentrancyGuard, Pausable, AutomationCompatibleInterface {
    using SafeERC20 for IERC20;

    // Kaia-native stablecoins
    IERC20 public immutable kaiaUSDT;
    IERC20 public immutable kaiaUSDC;
    IERC20 public immutable kaiaDAI;
    
    // Cross-chain bridge interfaces
    address public axelarGateway;
    address public layerZeroEndpoint;
    
    struct SIPPlan {
        uint256 monthlyAmount;
        uint256 totalTarget;
        uint256 totalDeposited;
        uint256 lastDeposit;
        uint256 interval;
        bool isActive;
        bool automationEnabled;
        string goal;
        address preferredToken; // USDT, USDC, or DAI
        uint8 riskTolerance; // 1-10 scale
    }
    
    struct YieldVault {
        string name;
        address vaultAddress;
        uint256 currentAPY;
        uint8 riskScore; // 1-10 scale
        bool isActive;
        uint256 totalDeposits;
    }
    
    struct AIRiskAssessment {
        uint8 overallRisk;
        uint256 expectedYield;
        string riskExplanation;
        uint256 timestamp;
    }
    
    // State variables
    mapping(address => SIPPlan) public userSIPs;
    mapping(address => uint256) public userBalances;
    mapping(address => AIRiskAssessment) public userRiskAssessments;
    mapping(address => bool) public authorizedAIAgents;
    mapping(uint256 => YieldVault) public yieldVaults;
    
    address[] public activeSIPUsers;
    uint256 public vaultCount;
    uint256 public totalValueLocked;
    
    // Events
    event SIPCreated(address indexed user, uint256 monthlyAmount, uint256 totalTarget, string goal);
    event SIPDeposit(address indexed user, uint256 amount, address token);
    event AutoDepositExecuted(address indexed user, uint256 amount);
    event RiskAssessmentUpdated(address indexed user, uint8 riskScore, string explanation);
    event YieldVaultAdded(uint256 indexed vaultId, string name, address vaultAddress);
    event CrossChainDepositReceived(address indexed user, uint256 amount, string sourceChain);
    event AIActionExecuted(address indexed agent, address indexed user, string action);
    
    constructor(
        address _kaiaUSDT,
        address _kaiaUSDC,
        address _kaiaDAI,
        address _axelarGateway,
        address _layerZeroEndpoint
    ) Ownable(msg.sender) {
        kaiaUSDT = IERC20(_kaiaUSDT);
        kaiaUSDC = IERC20(_kaiaUSDC);
        kaiaDAI = IERC20(_kaiaDAI);
        axelarGateway = _axelarGateway;
        layerZeroEndpoint = _layerZeroEndpoint;
    }

    modifier onlyAIAgent() {
        require(authorizedAIAgents[msg.sender], "Only authorized AI agents");
        _;
    }

    // === AI AGENT MANAGEMENT ===
    function addAIAgent(address agent) external onlyOwner {
        authorizedAIAgents[agent] = true;
    }

    function removeAIAgent(address agent) external onlyOwner {
        authorizedAIAgents[agent] = false;
    }

    // === SIP CREATION WITH AI RISK ASSESSMENT ===
    function createSIP(
        uint256 monthlyAmount,
        uint256 totalTarget,
        uint256 intervalDays,
        string memory goal,
        address preferredToken,
        uint8 riskTolerance
    ) external whenNotPaused {
        require(monthlyAmount > 0, "Monthly amount must be > 0");
        require(totalTarget > 0, "Total target must be > 0");
        require(intervalDays > 0, "Interval must be > 0");
        require(riskTolerance >= 1 && riskTolerance <= 10, "Risk tolerance 1-10");
        require(
            preferredToken == address(kaiaUSDT) || 
            preferredToken == address(kaiaUSDC) || 
            preferredToken == address(kaiaDAI),
            "Invalid token"
        );
        
        userSIPs[msg.sender] = SIPPlan({
            monthlyAmount: monthlyAmount,
            totalTarget: totalTarget,
            totalDeposited: 0,
            lastDeposit: block.timestamp,
            interval: intervalDays * 1 days,
            isActive: true,
            automationEnabled: true,
            goal: goal,
            preferredToken: preferredToken,
            riskTolerance: riskTolerance
        });
        
        if (!isUserInArray(msg.sender)) {
            activeSIPUsers.push(msg.sender);
        }
        
        emit SIPCreated(msg.sender, monthlyAmount, totalTarget, goal);
    }

    // === AI-POWERED RISK ASSESSMENT ===
    function updateRiskAssessment(
        address user,
        uint8 overallRisk,
        uint256 expectedYield,
        string memory riskExplanation
    ) external onlyAIAgent {
        userRiskAssessments[user] = AIRiskAssessment({
            overallRisk: overallRisk,
            expectedYield: expectedYield,
            riskExplanation: riskExplanation,
            timestamp: block.timestamp
        });
        
        emit RiskAssessmentUpdated(user, overallRisk, riskExplanation);
    }

    // === YIELD VAULT MANAGEMENT ===
    function addYieldVault(
        string memory name,
        address vaultAddress,
        uint256 currentAPY,
        uint8 riskScore
    ) external onlyOwner {
        yieldVaults[vaultCount] = YieldVault({
            name: name,
            vaultAddress: vaultAddress,
            currentAPY: currentAPY,
            riskScore: riskScore,
            isActive: true,
            totalDeposits: 0
        });
        
        emit YieldVaultAdded(vaultCount, name, vaultAddress);
        vaultCount++;
    }

    // === SIP DEPOSIT WITH AI OPTIMIZATION ===
    function makeSIPDeposit() external nonReentrant whenNotPaused {
        _executeSIPDeposit(msg.sender);
    }

    function _executeSIPDeposit(address user) internal {
        SIPPlan storage plan = userSIPs[user];
        require(plan.isActive, "No active SIP");
        require(plan.totalDeposited < plan.totalTarget, "Target already reached");
        
        uint256 depositAmount = plan.monthlyAmount;
        if (plan.totalDeposited + depositAmount > plan.totalTarget) {
            depositAmount = plan.totalTarget - plan.totalDeposited;
        }
        
        IERC20 token = IERC20(plan.preferredToken);
        token.safeTransferFrom(user, address(this), depositAmount);
        
        plan.totalDeposited += depositAmount;
        plan.lastDeposit = block.timestamp;
        
        // AI-optimized vault allocation
        _allocateToOptimalVault(user, depositAmount, plan.preferredToken);
        
        totalValueLocked += depositAmount;
        emit SIPDeposit(user, depositAmount, plan.preferredToken);
    }

    function _allocateToOptimalVault(address user, uint256 amount, address token) internal {
        SIPPlan memory plan = userSIPs[user];
        uint256 bestVaultId = _findOptimalVault(plan.riskTolerance);
        
        if (bestVaultId < vaultCount && yieldVaults[bestVaultId].isActive) {
            YieldVault storage vault = yieldVaults[bestVaultId];
            vault.totalDeposits += amount;
            
            // Transfer to yield vault
            IERC20(token).safeTransfer(vault.vaultAddress, amount);
        } else {
            // Keep in contract as fallback
            userBalances[user] += amount;
        }
    }

    function _findOptimalVault(uint8 userRiskTolerance) internal view returns (uint256) {
        uint256 bestVault = 0;
        uint256 bestScore = 0;
        
        for (uint256 i = 0; i < vaultCount; i++) {
            if (!yieldVaults[i].isActive) continue;
            
            YieldVault memory vault = yieldVaults[i];
            
            // Score based on risk tolerance match and APY
            uint256 riskMatch = userRiskTolerance >= vault.riskScore ? 
                (10 - (userRiskTolerance - vault.riskScore)) : 
                (10 - (vault.riskScore - userRiskTolerance));
            
            uint256 score = (riskMatch * 100) + (vault.currentAPY / 100);
            
            if (score > bestScore) {
                bestScore = score;
                bestVault = i;
            }
        }
        
        return bestVault;
    }

    // === CHAINLINK AUTOMATION ===
    function checkUpkeep(bytes calldata)
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        address[] memory usersToProcess = new address[](activeSIPUsers.length);
        uint256 count = 0;
        
        for (uint256 i = 0; i < activeSIPUsers.length; i++) {
            address user = activeSIPUsers[i];
            SIPPlan memory plan = userSIPs[user];
            
            if (plan.isActive && 
                plan.automationEnabled &&
                plan.totalDeposited < plan.totalTarget &&
                block.timestamp >= plan.lastDeposit + plan.interval) {
                
                IERC20 token = IERC20(plan.preferredToken);
                if (token.allowance(user, address(this)) >= plan.monthlyAmount &&
                    token.balanceOf(user) >= plan.monthlyAmount) {
                    usersToProcess[count] = user;
                    count++;
                }
            }
        }
        
        if (count > 0) {
            address[] memory finalUsers = new address[](count);
            for (uint256 i = 0; i < count; i++) {
                finalUsers[i] = usersToProcess[i];
            }
            upkeepNeeded = true;
            performData = abi.encode(finalUsers);
        }
    }
    
    function performUpkeep(bytes calldata performData) external override {
        address[] memory usersToProcess = abi.decode(performData, (address[]));
        
        for (uint256 i = 0; i < usersToProcess.length; i++) {
            _executeSIPDeposit(usersToProcess[i]);
            emit AutoDepositExecuted(usersToProcess[i], userSIPs[usersToProcess[i]].monthlyAmount);
        }
    }

    // === AI AGENT FUNCTIONS ===
    function aiOptimizeAllocation(address user) external onlyAIAgent {
        SIPPlan memory plan = userSIPs[user];
        uint256 userBalance = userBalances[user];
        
        if (userBalance > 0) {
            _allocateToOptimalVault(user, userBalance, plan.preferredToken);
            userBalances[user] = 0;
        }
        
        emit AIActionExecuted(msg.sender, user, "allocation_optimized");
    }

    function aiAdjustRiskTolerance(address user, uint8 newRiskTolerance) external onlyAIAgent {
        require(newRiskTolerance >= 1 && newRiskTolerance <= 10, "Risk tolerance 1-10");
        userSIPs[user].riskTolerance = newRiskTolerance;
        emit AIActionExecuted(msg.sender, user, "risk_tolerance_adjusted");
    }

    // === CROSS-CHAIN FUNCTIONS ===
    function receiveCrossChainDeposit(
        address user,
        uint256 amount,
        string memory sourceChain
    ) external {
        // This would be called by Axelar/LayerZero relayers
        require(msg.sender == axelarGateway || msg.sender == layerZeroEndpoint, "Unauthorized");
        
        // Auto-convert to Kaia-USDT and allocate
        userBalances[user] += amount;
        totalValueLocked += amount;
        
        emit CrossChainDepositReceived(user, amount, sourceChain);
    }

    // === VIEW FUNCTIONS ===
    function getSIPProgress(address user) external view returns (
        uint256 monthlyAmount,
        uint256 totalTarget,
        uint256 totalDeposited,
        uint256 percentComplete,
        uint256 nextDepositTime,
        bool isActive,
        bool automationEnabled,
        string memory goal,
        address preferredToken,
        uint8 riskTolerance
    ) {
        SIPPlan memory plan = userSIPs[user];
        uint256 percent = plan.totalTarget > 0 ? (plan.totalDeposited * 100) / plan.totalTarget : 0;
        
        return (
            plan.monthlyAmount,
            plan.totalTarget,
            plan.totalDeposited,
            percent,
            plan.lastDeposit + plan.interval,
            plan.isActive,
            plan.automationEnabled,
            plan.goal,
            plan.preferredToken,
            plan.riskTolerance
        );
    }

    function getRiskAssessment(address user) external view returns (
        uint8 overallRisk,
        uint256 expectedYield,
        string memory riskExplanation,
        uint256 timestamp
    ) {
        AIRiskAssessment memory assessment = userRiskAssessments[user];
        return (
            assessment.overallRisk,
            assessment.expectedYield,
            assessment.riskExplanation,
            assessment.timestamp
        );
    }

    function getOptimalVaultForUser(address user) external view returns (
        uint256 vaultId,
        string memory vaultName,
        uint256 apy,
        uint8 riskScore
    ) {
        uint8 userRisk = userSIPs[user].riskTolerance;
        uint256 optimalVault = _findOptimalVault(userRisk);
        
        YieldVault memory vault = yieldVaults[optimalVault];
        return (optimalVault, vault.name, vault.currentAPY, vault.riskScore);
    }

    function isUserInArray(address user) internal view returns (bool) {
        for (uint256 i = 0; i < activeSIPUsers.length; i++) {
            if (activeSIPUsers[i] == user) return true;
        }
        return false;
    }

    // === EMERGENCY FUNCTIONS ===
    function emergencyPause() external onlyOwner {
        _pause();
    }

    function emergencyUnpause() external onlyOwner {
        _unpause();
    }

    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(owner(), amount);
    }
}
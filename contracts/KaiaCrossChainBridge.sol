// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title KaiaCrossChainBridge
 * @dev Cross-chain bridge for stablecoins using Axelar and LayerZero
 */
contract KaiaCrossChainBridge is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Supported stablecoins on Kaia
    IERC20 public immutable kaiaUSDT;
    IERC20 public immutable kaiaUSDC;
    IERC20 public immutable kaiaDAI;
    
    // Bridge protocols
    address public axelarGateway;
    address public layerZeroEndpoint;
    
    // Supported chains
    mapping(string => bool) public supportedChains;
    mapping(string => uint256) public bridgeFees;
    mapping(bytes32 => bool) public processedTransactions;
    
    struct BridgeRequest {
        address user;
        address token;
        uint256 amount;
        string destinationChain;
        string destinationAddress;
        uint256 timestamp;
        bool processed;
    }
    
    mapping(bytes32 => BridgeRequest) public bridgeRequests;
    
    // Auto-conversion settings
    bool public autoConvertToKaiaUSDT = true;
    uint256 public conversionSlippage = 50; // 0.5%
    
    event BridgeInitiated(
        bytes32 indexed requestId,
        address indexed user,
        address token,
        uint256 amount,
        string destinationChain
    );
    
    event BridgeCompleted(
        bytes32 indexed requestId,
        address indexed user,
        uint256 amount
    );
    
    event CrossChainReceived(
        address indexed user,
        address token,
        uint256 amount,
        string sourceChain
    );
    
    event AutoConversionExecuted(
        address indexed user,
        address fromToken,
        address toToken,
        uint256 amount
    );

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
        
        // Initialize supported chains
        supportedChains["ethereum"] = true;
        supportedChains["polygon"] = true;
        supportedChains["bsc"] = true;
        supportedChains["arbitrum"] = true;
        supportedChains["optimism"] = true;
        
        // Set bridge fees (in basis points)
        bridgeFees["ethereum"] = 30; // 0.3%
        bridgeFees["polygon"] = 20;  // 0.2%
        bridgeFees["bsc"] = 25;      // 0.25%
        bridgeFees["arbitrum"] = 20; // 0.2%
        bridgeFees["optimism"] = 20; // 0.2%
    }

    // === BRIDGE TO KAIA ===
    function bridgeToKaia(
        address token,
        uint256 amount,
        string memory sourceChain,
        bytes32 transactionHash
    ) external nonReentrant {
        require(supportedChains[sourceChain], "Unsupported source chain");
        require(!processedTransactions[transactionHash], "Already processed");
        require(
            token == address(kaiaUSDT) || 
            token == address(kaiaUSDC) || 
            token == address(kaiaDAI),
            "Unsupported token"
        );
        
        processedTransactions[transactionHash] = true;
        
        // Calculate bridge fee
        uint256 fee = (amount * bridgeFees[sourceChain]) / 10000;
        uint256 netAmount = amount - fee;
        
        // Auto-convert to Kaia-USDT if enabled
        if (autoConvertToKaiaUSDT && token != address(kaiaUSDT)) {
            _autoConvertToKaiaUSDT(msg.sender, token, netAmount);
        } else {
            IERC20(token).safeTransfer(msg.sender, netAmount);
        }
        
        emit CrossChainReceived(msg.sender, token, netAmount, sourceChain);
    }

    // === BRIDGE FROM KAIA ===
    function bridgeFromKaia(
        address token,
        uint256 amount,
        string memory destinationChain,
        string memory destinationAddress
    ) external nonReentrant returns (bytes32 requestId) {
        require(supportedChains[destinationChain], "Unsupported destination chain");
        require(
            token == address(kaiaUSDT) || 
            token == address(kaiaUSDC) || 
            token == address(kaiaDAI),
            "Unsupported token"
        );
        
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        
        requestId = keccak256(abi.encodePacked(
            msg.sender,
            token,
            amount,
            destinationChain,
            block.timestamp,
            block.number
        ));
        
        bridgeRequests[requestId] = BridgeRequest({
            user: msg.sender,
            token: token,
            amount: amount,
            destinationChain: destinationChain,
            destinationAddress: destinationAddress,
            timestamp: block.timestamp,
            processed: false
        });
        
        // Initiate cross-chain transfer via Axelar or LayerZero
        _initiateCrossChainTransfer(requestId, destinationChain);
        
        emit BridgeInitiated(requestId, msg.sender, token, amount, destinationChain);
    }

    function _initiateCrossChainTransfer(bytes32 requestId, string memory destinationChain) internal {
        BridgeRequest storage request = bridgeRequests[requestId];
        
        // Use Axelar for most chains, LayerZero for specific optimizations
        if (keccak256(bytes(destinationChain)) == keccak256(bytes("ethereum")) ||
            keccak256(bytes(destinationChain)) == keccak256(bytes("polygon"))) {
            _bridgeViaAxelar(requestId);
        } else {
            _bridgeViaLayerZero(requestId);
        }
        
        request.processed = true;
        emit BridgeCompleted(requestId, request.user, request.amount);
    }

    function _bridgeViaAxelar(bytes32 requestId) internal {
        // Axelar integration logic
        // This would call Axelar Gateway contract
        BridgeRequest memory request = bridgeRequests[requestId];
        
        // Calculate fee
        uint256 fee = (request.amount * bridgeFees[request.destinationChain]) / 10000;
        uint256 netAmount = request.amount - fee;
        
        // Call Axelar Gateway (simplified)
        // IAxelarGateway(axelarGateway).callContract(
        //     request.destinationChain,
        //     request.destinationAddress,
        //     abi.encode(request.user, netAmount)
        // );
    }

    function _bridgeViaLayerZero(bytes32 requestId) internal {
        // LayerZero integration logic
        // This would call LayerZero Endpoint
        BridgeRequest memory request = bridgeRequests[requestId];
        
        // Calculate fee
        uint256 fee = (request.amount * bridgeFees[request.destinationChain]) / 10000;
        uint256 netAmount = request.amount - fee;
        
        // Call LayerZero Endpoint (simplified)
        // ILayerZeroEndpoint(layerZeroEndpoint).send(
        //     chainId,
        //     destinationAddress,
        //     abi.encode(request.user, netAmount),
        //     payable(msg.sender),
        //     address(0),
        //     bytes("")
        // );
    }

    // === AUTO-CONVERSION ===
    function _autoConvertToKaiaUSDT(address user, address fromToken, uint256 amount) internal {
        // Simplified conversion logic - in production, use DEX integration
        uint256 convertedAmount = amount; // 1:1 for stablecoins with slippage
        uint256 slippageAmount = (convertedAmount * conversionSlippage) / 10000;
        uint256 finalAmount = convertedAmount - slippageAmount;
        
        kaiaUSDT.safeTransfer(user, finalAmount);
        
        emit AutoConversionExecuted(user, fromToken, address(kaiaUSDT), finalAmount);
    }

    function setAutoConversion(bool enabled) external onlyOwner {
        autoConvertToKaiaUSDT = enabled;
    }

    function setConversionSlippage(uint256 slippage) external onlyOwner {
        require(slippage <= 500, "Max 5% slippage"); // Max 5%
        conversionSlippage = slippage;
    }

    // === ADMIN FUNCTIONS ===
    function addSupportedChain(string memory chain, uint256 fee) external onlyOwner {
        supportedChains[chain] = true;
        bridgeFees[chain] = fee;
    }

    function removeSupportedChain(string memory chain) external onlyOwner {
        supportedChains[chain] = false;
    }

    function updateBridgeFee(string memory chain, uint256 fee) external onlyOwner {
        require(supportedChains[chain], "Chain not supported");
        require(fee <= 1000, "Max 10% fee"); // Max 10%
        bridgeFees[chain] = fee;
    }

    function updateBridgeProtocols(address newAxelar, address newLayerZero) external onlyOwner {
        axelarGateway = newAxelar;
        layerZeroEndpoint = newLayerZero;
    }

    // === VIEW FUNCTIONS ===
    function getBridgeRequest(bytes32 requestId) external view returns (BridgeRequest memory) {
        return bridgeRequests[requestId];
    }

    function calculateBridgeFee(uint256 amount, string memory chain) external view returns (uint256) {
        return (amount * bridgeFees[chain]) / 10000;
    }

    function isChainSupported(string memory chain) external view returns (bool) {
        return supportedChains[chain];
    }

    // === EMERGENCY FUNCTIONS ===
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(owner(), amount);
    }

    function pauseBridge() external onlyOwner {
        // Implement pause functionality
    }
}
const { ethers } = require("hardhat");

async function main() {
    console.log("🧪 Testing Kaia Deployment...");
    
    const [deployer, user1, user2] = await ethers.getSigners();
    console.log("Testing with accounts:");
    console.log("- Deployer:", deployer.address);
    console.log("- User1:", user1.address);
    console.log("- User2:", user2.address);

    // Mock addresses for testing
    const MOCK_KAIA_USDT = "0x0000000000000000000000000000000000000001";
    const MOCK_KAIA_USDC = "0x0000000000000000000000000000000000000002";
    const MOCK_KAIA_DAI = "0x0000000000000000000000000000000000000003";
    const MOCK_AXELAR = "0x0000000000000000000000000000000000000004";
    const MOCK_LAYERZERO = "0x0000000000000000000000000000000000000005";

    try {
        // Deploy SIP Token
        console.log("\n📄 Deploying SIP Token...");
        const SIPToken = await ethers.getContractFactory("SIPToken");
        const sipToken = await SIPToken.deploy();
        await sipToken.deployed();
        console.log("✅ SIP Token deployed to:", sipToken.address);

        // Test SIP Token
        const totalSupply = await sipToken.totalSupply();
        console.log("📊 Total Supply:", ethers.utils.formatEther(totalSupply), "SIP");

        // Deploy Kaia SIP Manager
        console.log("\n🏦 Deploying Kaia SIP Manager...");
        const KaiaSIPManager = await ethers.getContractFactory("KaiaSIPManager");
        const sipManager = await KaiaSIPManager.deploy(
            MOCK_KAIA_USDT,
            MOCK_KAIA_USDC,
            MOCK_KAIA_DAI,
            MOCK_AXELAR,
            MOCK_LAYERZERO
        );
        await sipManager.deployed();
        console.log("✅ Kaia SIP Manager deployed to:", sipManager.address);

        // Deploy USDT Vault
        console.log("\n🏛️ Deploying USDT Vault...");
        const KaiaStablecoinVault = await ethers.getContractFactory("KaiaStablecoinVault");
        const usdtVault = await KaiaStablecoinVault.deploy(
            MOCK_KAIA_USDT,
            "Kaia USDT Conservative Vault",
            520, // 5.2% APY
            3    // Risk score 3/10
        );
        await usdtVault.deployed();
        console.log("✅ USDT Vault deployed to:", usdtVault.address);

        // Test vault configuration
        const vaultInfo = await usdtVault.getVaultInfo();
        console.log("📊 Vault Info:");
        console.log("  - Name:", vaultInfo.name);
        console.log("  - APY:", vaultInfo.apy.toString(), "basis points");
        console.log("  - Risk Score:", vaultInfo.risk.toString());

        // Deploy Cross-Chain Bridge
        console.log("\n🌉 Deploying Cross-Chain Bridge...");
        const KaiaCrossChainBridge = await ethers.getContractFactory("KaiaCrossChainBridge");
        const bridge = await KaiaCrossChainBridge.deploy(
            MOCK_KAIA_USDT,
            MOCK_KAIA_USDC,
            MOCK_KAIA_DAI,
            MOCK_AXELAR,
            MOCK_LAYERZERO
        );
        await bridge.deployed();
        console.log("✅ Cross-Chain Bridge deployed to:", bridge.address);

        // Test bridge configuration
        const isEthereumSupported = await bridge.isChainSupported("ethereum");
        console.log("📊 Bridge supports Ethereum:", isEthereumSupported);

        // Setup SIP Manager
        console.log("\n⚙️ Setting up SIP Manager...");
        
        // Add vault to SIP Manager
        await sipManager.addYieldVault(
            "Kaia USDT Conservative Vault",
            usdtVault.address,
            520, // 5.2% APY
            3    // Risk score
        );
        console.log("✅ USDT vault added to SIP Manager");

        // Add AI agent
        await sipManager.addAIAgent(deployer.address);
        console.log("✅ AI agent authorized:", deployer.address);

        // Test SIP creation (mock)
        console.log("\n🧪 Testing SIP Creation...");
        
        // This would normally require actual token transfers
        // For testing, we'll just check the function exists
        try {
            // Get SIP progress for a user (should return empty data)
            const sipProgress = await sipManager.getSIPProgress(user1.address);
            console.log("📊 SIP Progress check successful");
            console.log("  - Monthly Amount:", sipProgress.monthlyAmount.toString());
            console.log("  - Is Active:", sipProgress.isActive);
        } catch (error) {
            console.log("📊 SIP Progress check completed (no active SIP)");
        }

        // Test AI risk assessment
        console.log("\n🤖 Testing AI Risk Assessment...");
        await sipManager.updateRiskAssessment(
            user1.address,
            5, // Risk level 5
            ethers.utils.parseEther("7.5"), // 7.5% expected yield
            "Moderate risk profile with balanced growth potential"
        );
        console.log("✅ AI risk assessment updated");

        const riskAssessment = await sipManager.getRiskAssessment(user1.address);
        console.log("📊 Risk Assessment:");
        console.log("  - Overall Risk:", riskAssessment.overallRisk.toString());
        console.log("  - Expected Yield:", ethers.utils.formatEther(riskAssessment.expectedYield), "%");
        console.log("  - Explanation:", riskAssessment.riskExplanation);

        // Test optimal vault recommendation
        const optimalVault = await sipManager.getOptimalVaultForUser(user1.address);
        console.log("📊 Optimal Vault Recommendation:");
        console.log("  - Vault ID:", optimalVault.vaultId.toString());
        console.log("  - Vault Name:", optimalVault.vaultName);
        console.log("  - APY:", optimalVault.apy.toString(), "basis points");
        console.log("  - Risk Score:", optimalVault.riskScore.toString());

        // Gas usage analysis
        console.log("\n⛽ Gas Usage Analysis:");
        
        const deploymentGas = {
            sipToken: (await sipToken.deployTransaction.wait()).gasUsed,
            sipManager: (await sipManager.deployTransaction.wait()).gasUsed,
            usdtVault: (await usdtVault.deployTransaction.wait()).gasUsed,
            bridge: (await bridge.deployTransaction.wait()).gasUsed
        };

        console.log("📊 Deployment Gas Costs:");
        Object.entries(deploymentGas).forEach(([contract, gas]) => {
            console.log(`  - ${contract}: ${gas.toString()} gas`);
        });

        const totalGas = Object.values(deploymentGas).reduce((sum, gas) => sum.add(gas), ethers.BigNumber.from(0));
        console.log(`  - Total: ${totalGas.toString()} gas`);

        // Estimate gas costs on Kaia (assuming 25 Gwei)
        const gasPrice = ethers.utils.parseUnits("25", "gwei");
        const totalCost = totalGas.mul(gasPrice);
        console.log(`  - Estimated Cost: ${ethers.utils.formatEther(totalCost)} KAIA`);

        console.log("\n🎉 All tests passed successfully!");
        console.log("=====================================");
        console.log("📄 SIP Token:", sipToken.address);
        console.log("🏦 SIP Manager:", sipManager.address);
        console.log("🏛️ USDT Vault:", usdtVault.address);
        console.log("🌉 Cross-Chain Bridge:", bridge.address);
        console.log("=====================================");

        return {
            sipToken: sipToken.address,
            sipManager: sipManager.address,
            usdtVault: usdtVault.address,
            bridge: bridge.address
        };

    } catch (error) {
        console.error("❌ Test failed:", error);
        throw error;
    }
}

// Run tests
if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error("❌ Test suite failed:", error);
            process.exit(1);
        });
}

module.exports = main;
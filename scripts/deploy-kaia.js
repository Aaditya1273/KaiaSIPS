const { ethers } = require("hardhat");

async function main() {
    console.log("🌊 Deploying 3SIPS to Kaia Network...");
    
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());

    // Kaia network addresses (these would be actual addresses on Kaia)
    const KAIA_USDT = "0x0000000000000000000000000000000000000001"; // Placeholder
    const KAIA_USDC = "0x0000000000000000000000000000000000000002"; // Placeholder  
    const KAIA_DAI = "0x0000000000000000000000000000000000000003";  // Placeholder
    const AXELAR_GATEWAY = "0x0000000000000000000000000000000000000004"; // Placeholder
    const LAYERZERO_ENDPOINT = "0x0000000000000000000000000000000000000005"; // Placeholder

    // Deploy SIP Token first
    console.log("\n📄 Deploying SIP Token...");
    const SIPToken = await ethers.getContractFactory("SIPToken");
    const sipToken = await SIPToken.deploy();
    await sipToken.deployed();
    console.log("✅ SIP Token deployed to:", sipToken.address);

    // Deploy Kaia SIP Manager
    console.log("\n🏦 Deploying Kaia SIP Manager...");
    const KaiaSIPManager = await ethers.getContractFactory("KaiaSIPManager");
    const sipManager = await KaiaSIPManager.deploy(
        KAIA_USDT,
        KAIA_USDC,
        KAIA_DAI,
        AXELAR_GATEWAY,
        LAYERZERO_ENDPOINT
    );
    await sipManager.deployed();
    console.log("✅ Kaia SIP Manager deployed to:", sipManager.address);

    // Deploy Stablecoin Vaults
    console.log("\n🏛️ Deploying Stablecoin Vaults...");
    
    const KaiaStablecoinVault = await ethers.getContractFactory("KaiaStablecoinVault");
    
    // USDT Vault (Conservative - 5.2% APY, Risk Score 3)
    const usdtVault = await KaiaStablecoinVault.deploy(
        KAIA_USDT,
        "Kaia USDT Conservative Vault",
        520, // 5.2% APY
        3    // Risk score 3/10
    );
    await usdtVault.deployed();
    console.log("✅ USDT Vault deployed to:", usdtVault.address);

    // USDC Vault (Moderate - 7.8% APY, Risk Score 5)
    const usdcVault = await KaiaStablecoinVault.deploy(
        KAIA_USDC,
        "Kaia USDC Moderate Vault",
        780, // 7.8% APY
        5    // Risk score 5/10
    );
    await usdcVault.deployed();
    console.log("✅ USDC Vault deployed to:", usdcVault.address);

    // DAI Vault (Aggressive - 10.5% APY, Risk Score 7)
    const daiVault = await KaiaStablecoinVault.deploy(
        KAIA_DAI,
        "Kaia DAI Aggressive Vault",
        1050, // 10.5% APY
        7     // Risk score 7/10
    );
    await daiVault.deployed();
    console.log("✅ DAI Vault deployed to:", daiVault.address);

    // Deploy Cross-Chain Bridge
    console.log("\n🌉 Deploying Cross-Chain Bridge...");
    const KaiaCrossChainBridge = await ethers.getContractFactory("KaiaCrossChainBridge");
    const bridge = await KaiaCrossChainBridge.deploy(
        KAIA_USDT,
        KAIA_USDC,
        KAIA_DAI,
        AXELAR_GATEWAY,
        LAYERZERO_ENDPOINT
    );
    await bridge.deployed();
    console.log("✅ Cross-Chain Bridge deployed to:", bridge.address);

    // Setup vaults in SIP Manager
    console.log("\n⚙️ Setting up yield vaults...");
    
    await sipManager.addYieldVault(
        "Kaia USDT Conservative Vault",
        usdtVault.address,
        520, // 5.2% APY
        3    // Risk score
    );
    console.log("✅ USDT vault added to SIP Manager");

    await sipManager.addYieldVault(
        "Kaia USDC Moderate Vault", 
        usdcVault.address,
        780, // 7.8% APY
        5    // Risk score
    );
    console.log("✅ USDC vault added to SIP Manager");

    await sipManager.addYieldVault(
        "Kaia DAI Aggressive Vault",
        daiVault.address,
        1050, // 10.5% APY
        7     // Risk score
    );
    console.log("✅ DAI vault added to SIP Manager");

    // Setup AI agent (deployer as initial AI agent)
    console.log("\n🤖 Setting up AI agent...");
    await sipManager.addAIAgent(deployer.address);
    console.log("✅ AI agent authorized:", deployer.address);

    // Setup vault AI optimizers
    await usdtVault.setAIYieldOptimizer(deployer.address);
    await usdcVault.setAIYieldOptimizer(deployer.address);
    await daiVault.setAIYieldOptimizer(deployer.address);
    console.log("✅ AI yield optimizers configured");

    // Print deployment summary
    console.log("\n🎉 Deployment Complete!");
    console.log("=====================================");
    console.log("📄 SIP Token:", sipToken.address);
    console.log("🏦 Kaia SIP Manager:", sipManager.address);
    console.log("🏛️ USDT Vault:", usdtVault.address);
    console.log("🏛️ USDC Vault:", usdcVault.address);
    console.log("🏛️ DAI Vault:", daiVault.address);
    console.log("🌉 Cross-Chain Bridge:", bridge.address);
    console.log("=====================================");

    // Save deployment addresses
    const deploymentInfo = {
        network: "kaia",
        timestamp: new Date().toISOString(),
        deployer: deployer.address,
        contracts: {
            sipToken: sipToken.address,
            sipManager: sipManager.address,
            usdtVault: usdtVault.address,
            usdcVault: usdcVault.address,
            daiVault: daiVault.address,
            crossChainBridge: bridge.address
        },
        vaults: [
            {
                name: "Kaia USDT Conservative Vault",
                address: usdtVault.address,
                apy: "5.2%",
                riskScore: 3,
                token: "USDT"
            },
            {
                name: "Kaia USDC Moderate Vault",
                address: usdcVault.address,
                apy: "7.8%",
                riskScore: 5,
                token: "USDC"
            },
            {
                name: "Kaia DAI Aggressive Vault",
                address: daiVault.address,
                apy: "10.5%",
                riskScore: 7,
                token: "DAI"
            }
        ]
    };

    console.log("\n💾 Saving deployment info...");
    const fs = require('fs');
    fs.writeFileSync(
        'deployments/kaia-deployment.json',
        JSON.stringify(deploymentInfo, null, 2)
    );
    console.log("✅ Deployment info saved to deployments/kaia-deployment.json");

    // Verification instructions
    console.log("\n🔍 Contract Verification:");
    console.log("Run these commands to verify on KaiaScan:");
    console.log(`npx hardhat verify --network kaia ${sipToken.address}`);
    console.log(`npx hardhat verify --network kaia ${sipManager.address} "${KAIA_USDT}" "${KAIA_USDC}" "${KAIA_DAI}" "${AXELAR_GATEWAY}" "${LAYERZERO_ENDPOINT}"`);
    console.log(`npx hardhat verify --network kaia ${usdtVault.address} "${KAIA_USDT}" "Kaia USDT Conservative Vault" 520 3`);
    console.log(`npx hardhat verify --network kaia ${usdcVault.address} "${KAIA_USDC}" "Kaia USDC Moderate Vault" 780 5`);
    console.log(`npx hardhat verify --network kaia ${daiVault.address} "${KAIA_DAI}" "Kaia DAI Aggressive Vault" 1050 7`);
    console.log(`npx hardhat verify --network kaia ${bridge.address} "${KAIA_USDT}" "${KAIA_USDC}" "${KAIA_DAI}" "${AXELAR_GATEWAY}" "${LAYERZERO_ENDPOINT}"`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
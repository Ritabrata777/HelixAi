import { ethers } from "ethers";
import { readFileSync } from "fs";
import { config as dotenvConfig } from "dotenv";
dotenvConfig();

async function main() {
    console.log("Deploying SampleTracker to Polygon Amoy...\n");

    // Load compiled artifact (compile first with: npx hardhat compile)
    let artifact;
    try {
        artifact = JSON.parse(
            readFileSync("./artifacts/contracts/SampleTracker.sol/SampleTracker.json", "utf-8")
        );
    } catch (e) {
        console.log("Contract not compiled. Run: npx hardhat compile");
        process.exit(1);
    }

    // Setup provider and wallet
    const rpcUrl = process.env.AMOY_RPC_URL || "https://rpc-amoy.polygon.technology";
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    if (!process.env.PRIVATE_KEY) {
        console.log("ERROR: PRIVATE_KEY not set in .env");
        process.exit(1);
    }

    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    console.log(`Network: Polygon Amoy (Chain ID: 80002)`);
    console.log(`Deployer: ${wallet.address}`);

    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log(`Balance: ${ethers.formatEther(balance)} MATIC\n`);

    if (balance === 0n) {
        console.log("❌ Wallet has 0 balance!");
        console.log("   Get testnet MATIC from: https://faucet.polygon.technology/");
        process.exit(1);
    }

    // Deploy contract
    console.log("Deploying contract...");
    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
    const contract = await factory.deploy();

    const tx = contract.deploymentTransaction();
    console.log(`Transaction hash: ${tx.hash}`);
    console.log("Waiting for confirmation...\n");

    await contract.waitForDeployment();

    const address = await contract.getAddress();
    console.log(`✅ SampleTracker deployed to: ${address}`);
    console.log(`\n📝 Add to your .env:`);
    console.log(`REACT_APP_CONTRACT_ADDRESS=${address}`);
    console.log(`\n🔍 View on PolygonScan:`);
    console.log(`https://amoy.polygonscan.com/address/${address}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Deployment failed:", error.message);
        process.exit(1);
    });

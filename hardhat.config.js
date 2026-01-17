import { config as dotenvConfig } from "dotenv";
import "@nomicfoundation/hardhat-ethers";
dotenvConfig();

/** @type import('hardhat/config').HardhatUserConfig */
export default {
    solidity: "0.8.19",
    networks: {
        amoy: {
            type: "http",
            url: process.env.AMOY_RPC_URL || "https://rpc-amoy.polygon.technology",
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            chainId: 80002,
        },
    },
    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts",
    },
};

#!/usr/bin/env node

import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

console.log('🧪 Testing Blockchain Connection...\n');

async function testBlockchain() {
    try {
        // Test RPC connection
        const rpcUrl = process.env.REACT_APP_POLYGON_AMOY_RPC || 'https://rpc-amoy.polygon.technology';
        console.log(`📡 Connecting to: ${rpcUrl}`);
        
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        
        // Test network connection
        const network = await provider.getNetwork();
        console.log(`✅ Connected to network: ${network.name} (Chain ID: ${network.chainId})`);
        
        // Test latest block
        const blockNumber = await provider.getBlockNumber();
        console.log(`📦 Latest block: ${blockNumber}`);
        
        // Test contract address
        const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
        if (contractAddress) {
            console.log(`📋 Contract address: ${contractAddress}`);
            
            // Check if contract exists
            const code = await provider.getCode(contractAddress);
            if (code === '0x') {
                console.log('⚠️  Contract not deployed at this address');
            } else {
                console.log('✅ Contract found and deployed');
            }
        } else {
            console.log('⚠️  No contract address configured');
        }
        
        console.log('\n🎉 Blockchain connection test completed successfully!');
        
    } catch (error) {
        console.error('❌ Blockchain test failed:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('   1. Check your internet connection');
        console.log('   2. Verify REACT_APP_POLYGON_AMOY_RPC in .env');
        console.log('   3. Try a different RPC endpoint');
        process.exit(1);
    }
}

testBlockchain();
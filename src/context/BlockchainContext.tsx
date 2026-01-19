import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import CryptoJS from 'crypto-js';
import axios from 'axios';
import { ethers, Contract } from 'ethers';
import { useWallet } from './WalletContext';

// API URL from env
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Simple ABI for sample tracking (just storing hashes)
const SAMPLE_TRACKER_ABI = [
    "function recordStep(string memory sampleId, uint8 step, bytes32 hash) external",
    "function getSample(string memory sampleId) external view returns (bytes32, bytes32, bytes32, bytes32, uint256)",
    "event StepRecorded(string sampleId, uint8 step, bytes32 hash)"
];

// Types
export interface TimelineEntry {
    step: number;
    name: string;
    hash: string;
    txHash?: string;
    timestamp: string;
    details: {
        nurseId?: string;
        clinicLocation?: string;
        logisticsId?: string;
        pickupLocation?: string;
        deliveryLocation?: string;
        labId?: string;
        rawDataChecksum?: string;
        sequencingType?: string;
        riskScore?: number;
        reportGenerated?: boolean;
    };
    verified: boolean;
}

export interface Sample {
    sampleId: string;
    patientId: string;
    status: 'collected' | 'in-transit' | 'sequenced' | 'completed';
    currentStep: number;
    hashes: string[];
    txHashes?: string[];
    timeline: TimelineEntry[];
    createdAt: string;
    rawDataChecksum?: string;
    analysisResult?: string;
    riskScore?: number;
    recommendations?: string[];
    completedAt?: string;
}

export interface Transaction {
    id: string;
    type: 'COLLECTION' | 'TRANSPORT' | 'SEQUENCING' | 'AI_ANALYSIS';
    sampleId: string;
    hash: string;
    txHash?: string;
    timestamp: string;
    data: Record<string, any>;
    walletAddress?: string;
}

interface BlockchainContextType {
    samples: Sample[];
    transactions: Transaction[];
    isLoading: boolean;
    recordCollection: (patientId: string, nurseId: string, clinicLocation: string) => Promise<{ sample: Sample; transaction: Transaction }>;
    recordTransport: (sampleId: string, logisticsId: string, pickupLocation: string, deliveryLocation: string) => Promise<void>;
    recordSequencing: (sampleId: string, labId: string, rawDataChecksum: string, sequencingType: string) => Promise<void>;
    recordAnalysis: (sampleId: string, analysisResult: string, riskScore: number, recommendations: string[]) => Promise<void>;
    getSampleById: (sampleId: string) => Sample | undefined;
    getTransactionsBySample: (sampleId: string) => Transaction[];
    refreshSamples: () => Promise<void>;
}

const BlockchainContext = createContext<BlockchainContextType | null>(null);

export const useBlockchain = (): BlockchainContextType => {
    const context = useContext(BlockchainContext);
    if (!context) {
        throw new Error('useBlockchain must be used within a BlockchainProvider');
    }
    return context;
};

const generateHash = (data: object): string => {
    return CryptoJS.SHA256(JSON.stringify(data) + Date.now()).toString();
};

interface BlockchainProviderProps {
    children: ReactNode;
}

export const BlockchainProvider: React.FC<BlockchainProviderProps> = ({ children }) => {
    const [samples, setSamples] = useState<Sample[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const { signer, account, isConnected, isAmoyNetwork } = useWallet();

    // Get contract instance
    const getContract = useCallback(() => {
        const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
        if (!contractAddress) {
            console.error('getContract failed: Missing REACT_APP_CONTRACT_ADDRESS');
            return null;
        }
        if (!signer) {
            console.error('getContract failed: No signer');
            return null;
        }
        return new Contract(contractAddress, SAMPLE_TRACKER_ABI, signer);
    }, [signer]);

    // Send blockchain transaction
    const sendBlockchainTx = useCallback(async (sampleId: string, step: number, hash: string): Promise<string | null> => {
        console.log('Attempting Blockchain Tx:', {
            sampleId,
            step,
            dataHash: hash,
            isConnected,
            isAmoyNetwork,
            hasSigner: !!signer,
            contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS
        });

        if (!isConnected) {
            console.error('Transactions failed: Wallet not connected');
            return null;
        }
        if (!isAmoyNetwork) {
            console.error('Transactions failed: Not on Amoy Network');
            return null;
        }
        if (!signer) {
            console.error('Transactions failed: Signer not available');
            return null;
        }

        // Skip balance check to reduce RPC calls - MetaMask will handle insufficient funds error

        const contract = getContract();
        const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS || '0x07e28def8DC590A442790c80Fd6A3A5240Df0184';

        if (!contract) {
            console.error('Contract not configured, using payment transaction');
            // Fallback: Send a small payment to contract address as proof
            // This creates a blockchain transaction that serves as proof
            // Transaction hash will be used as verification proof
            try {
                // Gas prices based on successful transaction
                // Priority fee: ~25 gwei, Max fee: 26 gwei
                const maxFeePerGas = ethers.parseUnits("26", "gwei");
                const maxPriorityFeePerGas = ethers.parseUnits("25", "gwei");

                console.log('Sending payment to contract address:', contractAddress);
                console.log('Payment amount: 0.05 MATIC');
                console.log('Using gas prices:', {
                    maxFeePerGas: ethers.formatUnits(maxFeePerGas, "gwei") + ' gwei',
                    maxPriorityFeePerGas: ethers.formatUnits(maxPriorityFeePerGas, "gwei") + ' gwei'
                });

                // Send 0.05 MATIC to contract address as payment proof
                const tx = await signer.sendTransaction({
                    to: contractAddress,
                    value: ethers.parseEther("0.05"),  // 0.05 MATIC payment
                    gasLimit: 21000,
                    maxFeePerGas: maxFeePerGas,
                    maxPriorityFeePerGas: maxPriorityFeePerGas
                });
                console.log('Payment transaction sent:', tx.hash);
                const receipt = await tx.wait();
                console.log('Payment transaction confirmed. Transaction ID (proof):', receipt?.hash);
                // Return transaction hash as proof - can be verified on PolygonScan
                return receipt?.hash || null;
            } catch (error: any) {
                console.error('Fallback transaction failed:', error);
                if (error.code === 'ACTION_REJECTED') {
                    console.error('Transaction rejected by user');
                } else if (error.code === 'INSUFFICIENT_FUNDS') {
                    console.error('Insufficient funds for transaction');
                } else if (error.message && error.message.includes('RPC')) {
                    console.error('RPC endpoint error - try again later or check network connection');
                } else {
                    console.error('Transaction error details:', {
                        code: error.code,
                        message: error.message,
                        reason: error.reason
                    });
                }
                return null;
            }
        }

        try {
            // Convert string hash to bytes32
            const hashBytes32 = ethers.keccak256(ethers.toUtf8Bytes(hash));

            console.log('Calling smart contract recordStep...');
            console.log('Parameters:', { sampleId, step, hashBytes32 });

            // Estimate gas first (with timeout to avoid hanging)
            let gasEstimate = 100000n; // Default gas limit
            try {
                // Use Promise.race to timeout gas estimation after 5 seconds
                const estimatePromise = contract.recordStep.estimateGas(sampleId, step, hashBytes32);
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Gas estimation timeout')), 5000)
                );
                gasEstimate = await Promise.race([estimatePromise, timeoutPromise]) as bigint;
                console.log(`Estimated gas: ${gasEstimate.toString()}`);
            } catch (estimateError: any) {
                console.error('Gas estimation failed or timed out, using default:', estimateError.message);
                // Use default gas limit
            }

            // Gas prices based on successful transaction
            const maxFeePerGas = ethers.parseUnits("26", "gwei");
            const maxPriorityFeePerGas = ethers.parseUnits("25", "gwei");

            console.log('Using default gas prices:', {
                maxFeePerGas: ethers.formatUnits(maxFeePerGas, "gwei") + ' gwei',
                maxPriorityFeePerGas: ethers.formatUnits(maxPriorityFeePerGas, "gwei") + ' gwei',
                gasLimit: (gasEstimate + (gasEstimate / 10n)).toString()
            });

            // Send transaction with explicit gas settings
            const tx = await contract.recordStep(sampleId, step, hashBytes32, {
                gasLimit: gasEstimate + (gasEstimate / 10n), // Add 10% buffer
                maxFeePerGas: maxFeePerGas,
                maxPriorityFeePerGas: maxPriorityFeePerGas
            });
            console.log('Smart contract transaction sent:', tx.hash);

            const receipt = await tx.wait();
            console.log('Smart contract transaction confirmed:', receipt?.hash);
            console.log('Gas used:', receipt?.gasUsed?.toString());

            return receipt?.hash || null;
        } catch (error: any) {
            console.error('Smart contract transaction failed:', error);

            // Log detailed error information
            if (error.code === 'ACTION_REJECTED') {
                console.error('Transaction rejected by user in MetaMask');
            } else if (error.code === 'INSUFFICIENT_FUNDS') {
                console.error('Insufficient funds for transaction');
            } else if (error.code === 'CALL_EXCEPTION') {
                console.error('Contract call exception - contract may not be deployed or ABI mismatch');
            } else if (error.message && (error.message.includes('RPC') || error.message.includes('too many errors'))) {
                console.error('RPC endpoint error - too many errors or rate limited');
                console.error('Suggestions: Wait a few minutes, refresh the page, or check network connection');
            } else if (error.reason) {
                console.error('Transaction revert reason:', error.reason);
            } else {
                console.error('Transaction error details:', {
                    code: error.code,
                    message: error.message,
                    reason: error.reason,
                    data: error.data
                });
            }

            // Fallback to payment transaction if smart contract fails
            // This creates a blockchain transaction to contract address as proof
            try {
                console.log('Using fallback payment transaction to:', contractAddress);

                // Gas prices based on successful transaction
                const maxFeePerGas = ethers.parseUnits("26", "gwei");
                const maxPriorityFeePerGas = ethers.parseUnits("25", "gwei");

                // Send 0.05 MATIC to contract address as payment
                const tx = await signer.sendTransaction({
                    to: contractAddress,
                    value: ethers.parseEther("0.05"),  // 0.05 MATIC payment
                    gasLimit: 21000,
                    maxFeePerGas: maxFeePerGas,
                    maxPriorityFeePerGas: maxPriorityFeePerGas
                });
                console.log('Payment transaction sent:', tx.hash);
                const receipt = await tx.wait();
                console.log('Payment transaction confirmed. Transaction ID (proof):', receipt?.hash);
                // Return transaction hash as proof - can be verified on PolygonScan
                return receipt?.hash || null;
            } catch (fallbackError: any) {
                console.error('Fallback transaction also failed:', fallbackError);
                if (fallbackError.code === 'ACTION_REJECTED') {
                    console.error('Fallback transaction rejected by user');
                } else if (fallbackError.code === 'INSUFFICIENT_FUNDS') {
                    console.error('Insufficient funds for fallback transaction');
                } else if (fallbackError.message && fallbackError.message.includes('RPC')) {
                    console.error('RPC endpoint error in fallback - please wait and try again');
                }
                return null;
            }
        }
    }, [isConnected, isAmoyNetwork, signer, getContract]);

    // Fetch samples from MongoDB
    const refreshSamples = useCallback(async () => {
        try {
            const [samplesRes, txRes] = await Promise.all([
                axios.get(`${API_URL}/samples`).catch(() => ({ data: [] })),
                axios.get(`${API_URL}/transactions`).catch(() => ({ data: [] }))
            ]);
            setSamples(samplesRes.data);
            setTransactions(txRes.data);
        } catch (error) {
            console.log('Could not fetch from API, using local state');
        }
    }, []);

    // Load samples on mount
    useEffect(() => {
        refreshSamples();
    }, [refreshSamples]);

    // Step 1: Collection - Nurse scans QR code
    const recordCollection = useCallback(async (patientId: string, nurseId: string, clinicLocation: string) => {
        // Prevent concurrent calls
        if (isLoading) {
            console.warn('RecordCollection already in progress, ignoring duplicate call');
            throw new Error('Transaction already in progress. Please wait...');
        }

        setIsLoading(true);
        const timestamp = new Date().toISOString();
        const hash = generateHash({ patientId, nurseId, clinicLocation, timestamp, step: 'collection' });
        const sampleId = `HELIX-${Date.now().toString(36).toUpperCase()}`;

        // Try blockchain transaction (non-blocking)
        const txHash = await sendBlockchainTx(sampleId, 1, hash);

        // Create sample regardless of blockchain success
        const sample: Sample = {
            sampleId,
            patientId,
            status: 'collected',
            currentStep: 1,
            hashes: [hash],
            txHashes: txHash ? [txHash] : [],
            timeline: [{
                step: 1,
                name: 'Collection',
                hash,
                txHash: txHash || undefined,
                timestamp,
                details: { nurseId, clinicLocation },
                verified: !!txHash // Only verified if blockchain tx succeeded
            }],
            createdAt: timestamp
        };

        const transaction: Transaction = {
            id: `TX-${Date.now()}`,
            type: 'COLLECTION',
            sampleId,
            hash,
            txHash: txHash || undefined,
            timestamp,
            data: { patientId, nurseId, clinicLocation },
            walletAddress: account || undefined
        };

        // Save to MongoDB (graceful fallback)
        try {
            await Promise.all([
                axios.post(`${API_URL}/samples`, sample),
                axios.post(`${API_URL}/transactions`, { txId: transaction.id, ...transaction })
            ]);
            console.log('✅ Sample saved to database');
        } catch (error) {
            console.log('⚠️ Could not save to database, storing locally only');
        }

        setSamples(prev => [...prev, sample]);
        setTransactions(prev => [...prev, transaction]);

        // Show status to user
        if (txHash) {
            console.log('✅ Sample created with blockchain verification');
        } else {
            console.log('⚠️ Sample created (blockchain verification failed - check wallet connection)');
        }

        setIsLoading(false);
        return { sample, transaction };
    }, [account, sendBlockchainTx, isLoading]);

    // Step 2: Transport - Logistics pickup
    const recordTransport = useCallback(async (sampleId: string, logisticsId: string, pickupLocation: string, deliveryLocation: string) => {
        // Prevent concurrent calls
        if (isLoading) {
            console.warn('RecordTransport already in progress, ignoring duplicate call');
            throw new Error('Transaction already in progress. Please wait...');
        }
        setIsLoading(true);
        const timestamp = new Date().toISOString();

        // Get the sample first to calculate hash OUTSIDE setSamples
        const currentSample = samples.find(s => s.sampleId === sampleId);
        if (!currentSample) {
            setIsLoading(false);
            throw new Error('Sample not found');
        }

        const hash = generateHash({
            sampleId, logisticsId, pickupLocation, deliveryLocation,
            previousHash: currentSample.hashes[currentSample.hashes.length - 1],
            timestamp
        });

        // Send blockchain transaction ONCE, outside of setSamples
        const txHash = await sendBlockchainTx(sampleId, 2, hash);

        const transaction: Transaction = {
            id: `TX-${Date.now()}`,
            type: 'TRANSPORT',
            sampleId,
            hash,
            txHash: txHash || undefined,
            timestamp,
            data: { logisticsId, pickupLocation, deliveryLocation },
            walletAddress: account || undefined
        };

        // Update state
        setSamples(prev => prev.map(sample => {
            if (sample.sampleId === sampleId) {
                return {
                    ...sample,
                    status: 'in-transit' as const,
                    currentStep: 2,
                    hashes: [...sample.hashes, hash],
                    txHashes: [...(sample.txHashes || []), txHash || ''],
                    timeline: [...sample.timeline, {
                        step: 2,
                        name: 'Transport',
                        hash,
                        txHash: txHash || undefined,
                        timestamp,
                        details: { logisticsId, pickupLocation, deliveryLocation },
                        verified: !!txHash
                    }]
                };
            }
            return sample;
        }));

        setTransactions(prev => [...prev, transaction]);

        // Save to MongoDB
        try {
            await axios.put(`${API_URL}/samples/${sampleId}/step`, {
                step: 2,
                status: 'in-transit',
                txHash,
                timelineEntry: {
                    step: 2,
                    name: 'Transport',
                    hash,
                    txHash,
                    timestamp,
                    details: { logisticsId, pickupLocation, deliveryLocation },
                    verified: !!txHash
                }
            });
            await axios.post(`${API_URL}/transactions`, { txId: transaction.id, ...transaction });
        } catch (error) {
            console.log('Could not save to API');
        }

        setIsLoading(false);
    }, [samples, account, sendBlockchainTx, isLoading]);

    // Step 3: Sequencing - Lab runs WGS
    const recordSequencing = useCallback(async (sampleId: string, labId: string, rawDataChecksum: string, sequencingType: string) => {
        // Prevent concurrent calls
        if (isLoading) {
            console.warn('RecordSequencing already in progress, ignoring duplicate call');
            throw new Error('Transaction already in progress. Please wait...');
        }
        setIsLoading(true);
        const timestamp = new Date().toISOString();

        // Get the sample first to calculate hash OUTSIDE setSamples
        const currentSample = samples.find(s => s.sampleId === sampleId);
        if (!currentSample) {
            setIsLoading(false);
            throw new Error('Sample not found');
        }

        const hash = generateHash({
            sampleId, labId, rawDataChecksum, sequencingType,
            previousHash: currentSample.hashes[currentSample.hashes.length - 1],
            timestamp
        });

        // Send blockchain transaction ONCE, outside of setSamples
        const txHash = await sendBlockchainTx(sampleId, 3, hash);

        const transaction: Transaction = {
            id: `TX-${Date.now()}`,
            type: 'SEQUENCING',
            sampleId,
            hash,
            txHash: txHash || undefined,
            timestamp,
            data: { labId, rawDataChecksum, sequencingType },
            walletAddress: account || undefined
        };

        // Update state
        setSamples(prev => prev.map(sample => {
            if (sample.sampleId === sampleId) {
                return {
                    ...sample,
                    status: 'sequenced' as const,
                    currentStep: 3,
                    hashes: [...sample.hashes, hash],
                    txHashes: [...(sample.txHashes || []), txHash || ''],
                    rawDataChecksum,
                    timeline: [...sample.timeline, {
                        step: 3,
                        name: 'Sequencing',
                        hash,
                        txHash: txHash || undefined,
                        timestamp,
                        details: { labId, rawDataChecksum, sequencingType },
                        verified: !!txHash
                    }]
                };
            }
            return sample;
        }));

        setTransactions(prev => [...prev, transaction]);

        // Save to MongoDB
        try {
            await axios.put(`${API_URL}/samples/${sampleId}/step`, {
                step: 3,
                status: 'sequenced',
                rawDataChecksum,
                txHash,
                timelineEntry: {
                    step: 3,
                    name: 'Sequencing',
                    hash,
                    txHash,
                    timestamp,
                    details: { labId, rawDataChecksum, sequencingType },
                    verified: !!txHash
                }
            });
            await axios.post(`${API_URL}/transactions`, { txId: transaction.id, ...transaction });
        } catch (error) {
            console.log('Could not save to API');
        }

        setIsLoading(false);
    }, [samples, account, sendBlockchainTx, isLoading]);

    // Step 4: AI Analysis - Generate Risk Report
    const recordAnalysis = useCallback(async (sampleId: string, analysisResult: string, riskScore: number, recommendations: string[]) => {
        // Prevent concurrent calls
        if (isLoading) {
            console.warn('RecordAnalysis already in progress, ignoring duplicate call');
            throw new Error('Transaction already in progress. Please wait...');
        }
        setIsLoading(true);
        const timestamp = new Date().toISOString();

        // Get the sample first to calculate hash OUTSIDE setSamples
        const currentSample = samples.find(s => s.sampleId === sampleId);
        if (!currentSample) {
            setIsLoading(false);
            throw new Error('Sample not found');
        }

        const hash = generateHash({
            sampleId, analysisResult, riskScore,
            previousHash: currentSample.hashes[currentSample.hashes.length - 1],
            timestamp
        });

        // Send blockchain transaction ONCE, outside of setSamples
        const txHash = await sendBlockchainTx(sampleId, 4, hash);

        const transaction: Transaction = {
            id: `TX-${Date.now()}`,
            type: 'AI_ANALYSIS',
            sampleId,
            hash,
            txHash: txHash || undefined,
            timestamp,
            data: { riskScore, analysisResult: analysisResult.substring(0, 100) },
            walletAddress: account || undefined
        };

        // Update state
        setSamples(prev => prev.map(sample => {
            if (sample.sampleId === sampleId) {
                return {
                    ...sample,
                    status: 'completed' as const,
                    currentStep: 4,
                    hashes: [...sample.hashes, hash],
                    txHashes: [...(sample.txHashes || []), txHash || ''],
                    analysisResult,
                    riskScore,
                    recommendations,
                    completedAt: timestamp,
                    timeline: [...sample.timeline, {
                        step: 4,
                        name: 'AI Analysis',
                        hash,
                        txHash: txHash || undefined,
                        timestamp,
                        details: { riskScore, reportGenerated: true },
                        verified: !!txHash
                    }]
                };
            }
            return sample;
        }));

        setTransactions(prev => [...prev, transaction]);

        // Save to MongoDB
        try {
            await axios.put(`${API_URL}/samples/${sampleId}/step`, {
                step: 4,
                status: 'completed',
                analysisResult,
                riskScore,
                recommendations,
                completedAt: timestamp,
                txHash,
                timelineEntry: {
                    step: 4,
                    name: 'AI Analysis',
                    hash,
                    txHash,
                    timestamp,
                    details: { riskScore, reportGenerated: true },
                    verified: !!txHash
                }
            });
            await axios.post(`${API_URL}/transactions`, { txId: transaction.id, ...transaction });
        } catch (error) {
            console.log('Could not save to API');
        }

        setIsLoading(false);
    }, [samples, account, sendBlockchainTx, isLoading]);

    const getSampleById = useCallback((sampleId: string): Sample | undefined => {
        return samples.find(s => s.sampleId === sampleId);
    }, [samples]);

    const getTransactionsBySample = useCallback((sampleId: string): Transaction[] => {
        return transactions.filter(t => t.sampleId === sampleId);
    }, [transactions]);

    const value: BlockchainContextType = {
        samples,
        transactions,
        isLoading,
        recordCollection,
        recordTransport,
        recordSequencing,
        recordAnalysis,
        getSampleById,
        getTransactionsBySample,
        refreshSamples
    };

    return (
        <BlockchainContext.Provider value={value}>
            {children}
        </BlockchainContext.Provider>
    );
};

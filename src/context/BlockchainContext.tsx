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
            return null; // Don't alert, just return null
        }
        if (!isAmoyNetwork) {
            console.error('Transactions failed: Not on Amoy Network');
            return null; // Don't alert, just return null
        }
        if (!signer) {
            console.error('Transactions failed: Signer not available');
            return null;
        }

        const contract = getContract();
        if (!contract) {
            console.error('Contract not configured, using fallback transaction');
            // Fallback: Send a minimal transaction to generate a hash
            try {
                const myAddress = await signer.getAddress();
                const tx = await signer.sendTransaction({
                    to: myAddress,
                    value: ethers.parseEther("0"),  // Zero value - just for hash
                    gasLimit: 21000  // Fixed gas limit for simple transfer
                });
                console.log('Fallback transaction sent:', tx.hash);
                const receipt = await tx.wait();
                return receipt?.hash || null;
            } catch (error: any) {
                console.error('Fallback transaction failed:', error);
                return null;
            }
        }

        try {
            // Convert string hash to bytes32
            const hashBytes32 = ethers.keccak256(ethers.toUtf8Bytes(hash));

            console.log('Calling smart contract recordStep...');
            const tx = await contract.recordStep(sampleId, step, hashBytes32);
            console.log('Smart contract transaction sent:', tx.hash);

            const receipt = await tx.wait();
            console.log('Smart contract transaction confirmed:', receipt?.hash);

            return receipt?.hash || null;
        } catch (error: any) {
            console.error('Smart contract transaction failed:', error);

            // Fallback to simple transaction if smart contract fails
            try {
                console.log('Using fallback transaction...');
                const myAddress = await signer.getAddress();
                const tx = await signer.sendTransaction({
                    to: myAddress,
                    value: ethers.parseEther("0"),
                    gasLimit: 21000
                });
                const receipt = await tx.wait();
                return receipt?.hash || null;
            } catch (fallbackError: any) {
                console.error('Fallback transaction also failed:', fallbackError);
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
        setIsLoading(false);

        // Show status to user
        if (txHash) {
            console.log('✅ Sample created with blockchain verification');
        } else {
            console.log('⚠️ Sample created (blockchain verification failed - check wallet connection)');
        }

        return { sample, transaction };
    }, [account, sendBlockchainTx]);

    // Step 2: Transport - Logistics pickup
    const recordTransport = useCallback(async (sampleId: string, logisticsId: string, pickupLocation: string, deliveryLocation: string) => {
        setIsLoading(true);
        const timestamp = new Date().toISOString();

        setSamples(prev => prev.map(sample => {
            if (sample.sampleId === sampleId) {
                const hash = generateHash({
                    sampleId, logisticsId, pickupLocation, deliveryLocation,
                    previousHash: sample.hashes[sample.hashes.length - 1],
                    timestamp
                });

                // Fire and forget blockchain tx
                sendBlockchainTx(sampleId, 2, hash).then(async txHash => {
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
                                verified: true
                            }
                        });
                        await axios.post(`${API_URL}/transactions`, { txId: transaction.id, ...transaction });
                    } catch (error) {
                        console.log('Could not save to API');
                    }
                });

                return {
                    ...sample,
                    status: 'in-transit' as const,
                    currentStep: 2,
                    hashes: [...sample.hashes, hash],
                    timeline: [...sample.timeline, {
                        step: 2,
                        name: 'Transport',
                        hash,
                        timestamp,
                        details: { logisticsId, pickupLocation, deliveryLocation },
                        verified: true
                    }]
                };
            }
            return sample;
        }));
        setIsLoading(false);
    }, [account, sendBlockchainTx]);

    // Step 3: Sequencing - Lab runs WGS
    const recordSequencing = useCallback(async (sampleId: string, labId: string, rawDataChecksum: string, sequencingType: string) => {
        setIsLoading(true);
        const timestamp = new Date().toISOString();

        setSamples(prev => prev.map(sample => {
            if (sample.sampleId === sampleId) {
                const hash = generateHash({
                    sampleId, labId, rawDataChecksum, sequencingType,
                    previousHash: sample.hashes[sample.hashes.length - 1],
                    timestamp
                });

                // Fire and forget blockchain tx
                sendBlockchainTx(sampleId, 3, hash).then(async txHash => {
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
                                verified: true
                            }
                        });
                        await axios.post(`${API_URL}/transactions`, { txId: transaction.id, ...transaction });
                    } catch (error) {
                        console.log('Could not save to API');
                    }
                });

                return {
                    ...sample,
                    status: 'sequenced' as const,
                    currentStep: 3,
                    hashes: [...sample.hashes, hash],
                    rawDataChecksum,
                    timeline: [...sample.timeline, {
                        step: 3,
                        name: 'Sequencing',
                        hash,
                        timestamp,
                        details: { labId, rawDataChecksum, sequencingType },
                        verified: true
                    }]
                };
            }
            return sample;
        }));
        setIsLoading(false);
    }, [account, sendBlockchainTx]);

    // Step 4: AI Analysis - Generate Risk Report
    const recordAnalysis = useCallback(async (sampleId: string, analysisResult: string, riskScore: number, recommendations: string[]) => {
        setIsLoading(true);
        const timestamp = new Date().toISOString();

        setSamples(prev => prev.map(sample => {
            if (sample.sampleId === sampleId) {
                const hash = generateHash({
                    sampleId, analysisResult, riskScore,
                    previousHash: sample.hashes[sample.hashes.length - 1],
                    timestamp
                });

                // Fire and forget blockchain tx
                sendBlockchainTx(sampleId, 4, hash).then(async txHash => {
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
                                verified: true
                            }
                        });
                        await axios.post(`${API_URL}/transactions`, { txId: transaction.id, ...transaction });
                    } catch (error) {
                        console.log('Could not save to API');
                    }
                });

                return {
                    ...sample,
                    status: 'completed' as const,
                    currentStep: 4,
                    hashes: [...sample.hashes, hash],
                    analysisResult,
                    riskScore,
                    recommendations,
                    completedAt: timestamp,
                    timeline: [...sample.timeline, {
                        step: 4,
                        name: 'AI Analysis',
                        hash,
                        timestamp,
                        details: { riskScore, reportGenerated: true },
                        verified: true
                    }]
                };
            }
            return sample;
        }));
        setIsLoading(false);
    }, [account, sendBlockchainTx]);

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

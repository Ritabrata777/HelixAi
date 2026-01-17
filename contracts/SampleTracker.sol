// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title SampleTracker
 * @dev Tracks medical sample processing steps on Polygon Amoy blockchain
 * @notice Each step records an immutable hash for verification
 */
contract SampleTracker {
    
    struct SampleRecord {
        bytes32 collectionHash;    // Step 1: Collection hash
        bytes32 transportHash;     // Step 2: Transport hash
        bytes32 sequencingHash;    // Step 3: Sequencing hash
        bytes32 analysisHash;      // Step 4: AI Analysis hash
        uint256 createdAt;
        uint256 lastUpdated;
        address createdBy;
        uint8 currentStep;
    }
    
    // Mapping from sampleId to SampleRecord
    mapping(string => SampleRecord) public samples;
    
    // Events for frontend tracking
    event StepRecorded(string indexed sampleId, uint8 step, bytes32 hash, address recorder);
    event SampleCreated(string indexed sampleId, address creator);
    
    /**
     * @dev Record a step in the sample tracking process
     * @param sampleId Unique identifier for the sample (e.g., "HELIX-ABC123")
     * @param step Step number (1-4)
     * @param hash Hash of the step data
     */
    function recordStep(string memory sampleId, uint8 step, bytes32 hash) external {
        require(step >= 1 && step <= 4, "Invalid step number");
        require(hash != bytes32(0), "Hash cannot be empty");
        
        SampleRecord storage record = samples[sampleId];
        
        // If new sample, initialize it
        if (record.createdAt == 0) {
            record.createdAt = block.timestamp;
            record.createdBy = msg.sender;
            emit SampleCreated(sampleId, msg.sender);
        }
        
        // Record hash based on step
        if (step == 1) {
            record.collectionHash = hash;
        } else if (step == 2) {
            record.transportHash = hash;
        } else if (step == 3) {
            record.sequencingHash = hash;
        } else if (step == 4) {
            record.analysisHash = hash;
        }
        
        record.currentStep = step;
        record.lastUpdated = block.timestamp;
        
        emit StepRecorded(sampleId, step, hash, msg.sender);
    }
    
    /**
     * @dev Get sample record by ID
     * @param sampleId Unique identifier for the sample
     * @return collectionHash The collection step hash
     * @return transportHash The transport step hash
     * @return sequencingHash The sequencing step hash
     * @return analysisHash The analysis step hash
     * @return createdAt The sample creation timestamp
     */
    function getSample(string memory sampleId) external view returns (
        bytes32 collectionHash,
        bytes32 transportHash,
        bytes32 sequencingHash,
        bytes32 analysisHash,
        uint256 createdAt
    ) {
        SampleRecord storage record = samples[sampleId];
        return (
            record.collectionHash,
            record.transportHash,
            record.sequencingHash,
            record.analysisHash,
            record.createdAt
        );
    }
    
    /**
     * @dev Verify a specific step hash matches
     * @param sampleId Unique identifier for the sample
     * @param step Step number (1-4)
     * @param hash Hash to verify
     * @return bool True if hash matches
     */
    function verifyStep(string memory sampleId, uint8 step, bytes32 hash) external view returns (bool) {
        SampleRecord storage record = samples[sampleId];
        
        if (step == 1) return record.collectionHash == hash;
        if (step == 2) return record.transportHash == hash;
        if (step == 3) return record.sequencingHash == hash;
        if (step == 4) return record.analysisHash == hash;
        
        return false;
    }
    
    /**
     * @dev Get current step of a sample
     * @param sampleId Unique identifier for the sample
     * @return Current step number (0 if sample doesn't exist)
     */
    function getCurrentStep(string memory sampleId) external view returns (uint8) {
        return samples[sampleId].currentStep;
    }
}

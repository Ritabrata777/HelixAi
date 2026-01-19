// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title SampleTracker
 * @dev A smart contract for tracking the lifecycle of medical samples
 * across four key stages: Collection, Transport, Sequencing, and Analysis.
 * Each step is recorded with a cryptographic hash on the blockchain,
 * creating an immutable and verifiable audit trail.
 */
contract SampleTracker {

    // Represents a single medical sample's journey on the blockchain
    struct Sample {
        bytes32 hash1; // Hash for Collection step
        bytes32 hash2; // Hash for Transport step
        bytes32 hash3; // Hash for Sequencing step
        bytes32 hash4; // Hash for AI Analysis step
        uint256 currentStep; // The latest completed step (1-4)
    }

    // Mapping from a unique sample ID to its tracking data
    mapping(string => Sample) private samples;

    /**
     * @dev Emitted when a new step is successfully recorded for a sample.
     * @param sampleId The unique identifier for the sample.
     * @param step The step number being recorded (1-4).
     * @param hash The cryptographic hash associated with this step.
     */
    event StepRecorded(string indexed sampleId, uint8 step, bytes32 hash);

    /**
     * @dev Records a hash for a specific step in a sample's lifecycle.
     * It enforces sequential processing, ensuring a step cannot be recorded
     * until the previous one is complete.
     *
     * @param sampleId The unique identifier for the sample.
     * @param step The step number being recorded (1-4).
     * @param hash The cryptographic hash for the data at this step.
     */
    function recordStep(string memory sampleId, uint8 step, bytes32 hash) external {
        require(step >= 1 && step <= 4, "SampleTracker: Invalid step number");

        Sample storage sample = samples[sampleId];

        if (step == 1) {
            // Can be recorded anytime for a new sample
            sample.hash1 = hash;
        } else if (step == 2) {
            require(sample.currentStep == 1, "SampleTracker: Previous step not completed");
            sample.hash2 = hash;
        } else if (step == 3) {
            require(sample.currentStep == 2, "SampleTracker: Previous step not completed");
            sample.hash3 = hash;
        } else if (step == 4) {
            require(sample.currentStep == 3, "SampleTracker: Previous step not completed");
            sample.hash4 = hash;
        }
        
        sample.currentStep = step;

        emit StepRecorded(sampleId, step, hash);
    }

    /**
     * @dev Retrieves all the stored hashes and the current step for a given sample.
     * This allows external services to verify the complete tracking history.
     *
     * @param sampleId The unique identifier for the sample.
     * @return hash1 The hash for the Collection step.
     * @return hash2 The hash for the Transport step.
     * @return hash3 The hash for the Sequencing step.
     * @return hash4 The hash for the AI Analysis step.
     * @return currentStep The latest completed step number for the sample.
     */
    function getSample(string memory sampleId) 
        external 
        view 
        returns (bytes32 hash1, bytes32 hash2, bytes32 hash3, bytes32 hash4, uint256 currentStep) 
    {
        Sample storage sample = samples[sampleId];
        return (sample.hash1, sample.hash2, sample.hash3, sample.hash4, sample.currentStep);
    }
}

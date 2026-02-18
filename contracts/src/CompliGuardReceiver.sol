// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title CompliGuardReceiver
 * @notice Receives and stores compliance reports from Chainlink CRE workflow
 * @dev This contract stores compliance status, evidence hashes, and report history
 */
contract CompliGuardReceiver {
    // Events
    event ComplianceReportReceived(
        uint8 indexed status,
        bytes32 evidenceHash,
        string policyVersion,
        uint256 timestamp,
        uint8 controlCount
    );

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // Structs
    struct Report {
        uint8 status;          // 0=GREEN, 1=YELLOW, 2=RED
        bytes32 evidenceHash;  // SHA256 hash of evaluation inputs
        string policyVersion;  // Policy version used
        uint256 timestamp;     // When evaluation occurred
        uint8 controlCount;    // Number of controls evaluated
    }

    // State variables
    address public owner;
    Report public latestReport;
    Report[] public reportHistory;
    mapping(bytes32 => bool) public processedHashes;

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    /**
     * @notice Receive a compliance report from CRE workflow
     * @param _status Compliance status (0=GREEN, 1=YELLOW, 2=RED)
     * @param _evidenceHash SHA256 hash of evaluation inputs
     * @param _policyVersion Policy version string
     * @param _timestamp Unix timestamp of evaluation
     * @param _controlCount Number of controls evaluated
     */
    function receiveReport(
        uint8 _status,
        bytes32 _evidenceHash,
        string calldata _policyVersion,
        uint256 _timestamp,
        uint8 _controlCount
    ) external {
        require(_status <= 2, "Invalid status");
        require(!processedHashes[_evidenceHash], "Report already processed");

        latestReport = Report({
            status: _status,
            evidenceHash: _evidenceHash,
            policyVersion: _policyVersion,
            timestamp: _timestamp,
            controlCount: _controlCount
        });

        reportHistory.push(latestReport);
        processedHashes[_evidenceHash] = true;

        emit ComplianceReportReceived(
            _status,
            _evidenceHash,
            _policyVersion,
            _timestamp,
            _controlCount
        );
    }

    /**
     * @notice Get the total number of reports received
     */
    function getReportCount() external view returns (uint256) {
        return reportHistory.length;
    }

    /**
     * @notice Get a report by index
     */
    function getReport(uint256 index) external view returns (Report memory) {
        require(index < reportHistory.length, "Index out of bounds");
        return reportHistory[index];
    }

    /**
     * @notice Get the latest compliance status
     */
    function getLatestStatus() external view returns (uint8) {
        return latestReport.status;
    }

    /**
     * @notice Check if a report with given hash exists
     */
    function hasReport(bytes32 _evidenceHash) external view returns (bool) {
        return processedHashes[_evidenceHash];
    }

    /**
     * @notice Transfer ownership
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}

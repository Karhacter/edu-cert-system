// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title CertificateValidation
 * @dev Stores and validates certificates on the Ethereum blockchain
 */
contract CertificateValidation {
    address public owner;

    struct Certificate {
        string studentName;
        string courseName;
        uint256 issueDate;
        string ipfsHash; // IPFS hash of the certificate document
        bool isValid;
        address issuer;
    }

    // Mapping from certificate ID (hash) to Certificate
    mapping(bytes32 => Certificate) public certificates;

    // Events
    event CertificateIssued(
        bytes32 indexed certificateId,
        string studentName,
        string courseName,
        address issuer
    );
    event CertificateRevoked(bytes32 indexed certificateId);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    /**
     * @dev Issue a new certificate
     * @param _studentName Name of the student
     * @param _courseName Name of the course
     * @param _ipfsHash IPFS hash of the certificate document
     * @return certificateId The ID of the issued certificate
     */
    function issueCertificate(
        string memory _studentName,
        string memory _courseName,
        string memory _ipfsHash
    ) public returns (bytes32) {
        // Generate a unique ID for the certificate
        bytes32 certificateId = keccak256(
            abi.encodePacked(
                _studentName,
                _courseName,
                _ipfsHash,
                block.timestamp,
                msg.sender
            )
        );

        certificates[certificateId] = Certificate({
            studentName: _studentName,
            courseName: _courseName,
            issueDate: block.timestamp,
            ipfsHash: _ipfsHash,
            isValid: true,
            issuer: msg.sender
        });

        emit CertificateIssued(
            certificateId,
            _studentName,
            _courseName,
            msg.sender
        );

        return certificateId;
    }

    /**
     * @dev Revoke a certificate
     * @param _certificateId ID of the certificate to revoke
     */
    function revokeCertificate(bytes32 _certificateId) public {
        require(
            certificates[_certificateId].issuer == msg.sender ||
                msg.sender == owner,
            "Only issuer or owner can revoke"
        );
        require(
            certificates[_certificateId].isValid,
            "Certificate is already revoked or does not exist"
        );

        certificates[_certificateId].isValid = false;

        emit CertificateRevoked(_certificateId);
    }

    /**
     * @dev Verify a certificate
     * @param _certificateId ID of the certificate to verify
     * @return isValid Validity status of the certificate
     * @return studentName Name of the student
     * @return courseName Name of the course
     * @return issueDate Date when the certificate was issued
     * @return ipfsHash IPFS hash of the certificate document
     * @return issuer Address of the certificate issuer
     */
    function verifyCertificate(
        bytes32 _certificateId
    )
        public
        view
        returns (
            bool isValid,
            string memory studentName,
            string memory courseName,
            uint256 issueDate,
            string memory ipfsHash,
            address issuer
        )
    {
        Certificate memory cert = certificates[_certificateId];
        return (
            cert.isValid,
            cert.studentName,
            cert.courseName,
            cert.issueDate,
            cert.ipfsHash,
            cert.issuer
        );
    }
}

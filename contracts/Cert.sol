// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract CertificateRegistry {
    struct Certificate {
        string studentName;
        string courseName;
        string ipfsHash; // PDF on IPFS
        uint256 issueDate;
        bool isValid;
    }

    address public admin;
    mapping(bytes32 => Certificate) public certificates;

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    function issueCertificate(
        string memory studentName,
        string memory courseName,
        string memory ipfsHash
    ) public onlyAdmin returns (bytes32) {
        bytes32 certId = keccak256(
            abi.encodePacked(studentName, courseName, block.timestamp)
        );
        certificates[certId] = Certificate(
            studentName,
            courseName,
            ipfsHash,
            block.timestamp,
            true
        );
        return certId;
    }

    function verifyCertificate(
        bytes32 certId
    ) public view returns (Certificate memory) {
        require(
            certificates[certId].isValid,
            "Certificate not found or invalid"
        );
        return certificates[certId];
    }
}

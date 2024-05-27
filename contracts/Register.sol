// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Register {
    struct Resident {
        string did;
        string ipfsHash;
        bool isRegistered;
    }

    mapping(address => Resident) public residents;

    event Registration(address indexed user, string did, string ipfsHash);

    // Register a resident
    function registerResident(string memory _did, string memory _ipfsHash) public {
        require(bytes(_did).length > 0, "DID cannot be empty");
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(!residents[msg.sender].isRegistered, "Resident already registered");

        residents[msg.sender] = Resident(_did, _ipfsHash, true);
        emit Registration(msg.sender, _did, _ipfsHash);
    }

    // Verify resident registration
    function verifyResident(address _user) public view returns (string memory, string memory) {
        require(residents[_user].isRegistered, "Resident not registered");
        return (residents[_user].did, residents[_user].ipfsHash);
    }
}

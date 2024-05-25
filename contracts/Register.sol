// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Register {
    struct User {
        string did;
        string ipfsHash;
    }

    mapping(address => User) public users;

    function register(string memory _did, string memory _ipfsHash) public {
        users[msg.sender] = User(_did, _ipfsHash);
    }
}

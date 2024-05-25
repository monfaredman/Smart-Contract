// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

contract UserRegistration {
    struct UserInfo {
        string ipfsUserInfoHash; // IPFS hash of the user information
        string docFileIPFSHash; // IPFS hash of the document file
        uint256 depositAmount;
    }

    mapping(string => UserInfo) public users; // Using DID as the key
    string[] public registeredUsersDIDs;

    address private admin;

    uint256 public minimumRegistrationFee = 0.01 ether; // Set a default value for the minimum registration fee
    uint256 public lastFinalizedBlock; // Declare the variable to keep track of the last finalized block

    event UserRegistered(string indexed userDID, string ipfsUserInfoHash, string docFileIPFSHash);
    event Deposit(string indexed userDID, uint256 amount);
    event Withdrawal(address indexed withdrawer, uint256 amount);

    constructor() {
        admin = msg.sender;
    }

    function registerUser(string memory _did, string memory _ipfsUserInfoHash, string memory _docFileIPFSHash) external payable {
        require(msg.value >= minimumRegistrationFee, "A small fee is required to register");

        UserInfo memory newUser = UserInfo({
            ipfsUserInfoHash: _ipfsUserInfoHash,
            docFileIPFSHash: _docFileIPFSHash,
            depositAmount: 0
        });

        users[_did] = newUser;
        registeredUsersDIDs.push(_did);
        emit UserRegistered(_did, _ipfsUserInfoHash, _docFileIPFSHash);
    }

    function getUserInfo(string memory _did) external view returns (
        string memory ipfsUserInfoHash,
        string memory docFileIPFSHash,
        uint256 depositAmount
    ) {
        UserInfo memory user = users[_did];
        return (
            user.ipfsUserInfoHash,
            user.docFileIPFSHash,
            user.depositAmount
        );
    }

    function deposit(string memory _did) external payable {
        require(msg.value > 0, "Deposit amount must be greater than 0");

        users[_did].depositAmount += msg.value;
        emit Deposit(_did, msg.value);
    }

    function getNetworkBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getAllRegisteredUsersDIDs() public view returns (string[] memory) {
        return registeredUsersDIDs;
    }

    function withdraw(uint256 amount) public {
        require(amount <= address(this).balance, "Insufficient contract balance");
        require(block.number > lastFinalizedBlock + 6, "Please wait for more confirmations");

        lastFinalizedBlock = block.number; // Update the last finalized block
        payable(msg.sender).transfer(amount);
        emit Withdrawal(msg.sender, amount);
    }
}

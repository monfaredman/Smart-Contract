// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UserRegistration {
    struct UserInfo {
        string ipfsUserInfoHash; // IPFS hash of the user information
        string docFileIPFSHash; // IPFS hash of the document file
        bool isRegistered;
        uint256 depositAmount;
    }

    mapping(string => UserInfo) public users; // Using DID as the key
    string[] public registeredUsersDIDs;

    address private admin;
    bool private isAdminLoggedIn;
    string private constant adminUsername = "admin";
    string private constant adminPassword = "password"; // Hardcoded password for simplicity, not secure

    event UserRegistered(string indexed userDID, string ipfsUserInfoHash, string docFileIPFSHash);
    event Deposit(string indexed userDID, uint256 amount);
    event Withdrawal(address indexed admin, uint256 amount);

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        require(isAdminLoggedIn, "Admin must be logged in to perform this action");
        _;
    }

    function adminLogin(string memory username, string memory password) public {
        require(keccak256(abi.encodePacked(username)) == keccak256(abi.encodePacked(adminUsername)), "Invalid username");
        require(keccak256(abi.encodePacked(password)) == keccak256(abi.encodePacked(adminPassword)), "Invalid password");
        isAdminLoggedIn = true;
    }

    function adminLogout() public onlyAdmin {
        isAdminLoggedIn = false;
    }

    function registerUser(string memory _did, string memory _ipfsUserInfoHash, string memory _docFileIPFSHash) external {
        require(!users[_did].isRegistered, "User already registered");

        UserInfo memory newUser = UserInfo({
            ipfsUserInfoHash: _ipfsUserInfoHash,
            docFileIPFSHash: _docFileIPFSHash,
            isRegistered: true,
            depositAmount: 0
        });

        users[_did] = newUser;
        registeredUsersDIDs.push(_did);
        emit UserRegistered(_did, _ipfsUserInfoHash, _docFileIPFSHash);
    }

    function getUserInfo(string memory _did) external view returns (
        string memory ipfsUserInfoHash,
        string memory docFileIPFSHash,
        bool isRegistered,
        uint256 depositAmount
    ) {
        UserInfo memory user = users[_did];
        require(user.isRegistered, "User is not registered");

        return (
            user.ipfsUserInfoHash,
            user.docFileIPFSHash,
            user.isRegistered,
            user.depositAmount
        );
    }

    function deposit(string memory _did, uint256 amount) external payable {
        require(users[_did].isRegistered, "User is not registered");
        require(amount > 0, "Deposit amount must be greater than 0");
        require(msg.value == amount, "Sent value must match the deposit amount");

        users[_did].depositAmount += msg.value;
        emit Deposit(_did, msg.value);
    }

    function getNetworkBalance() public view onlyAdmin returns (uint256) {
        return address(this).balance;
    }

    function getAllRegisteredUsersDIDs() public view onlyAdmin returns (string[] memory) {
        return registeredUsersDIDs;
    }

    function withdraw(uint256 amount) public onlyAdmin {
        require(amount <= address(this).balance, "Insufficient contract balance");
        payable(admin).transfer(amount);
        emit Withdrawal(admin, amount);
    }
}



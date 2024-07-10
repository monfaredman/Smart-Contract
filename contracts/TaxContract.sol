// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UserRegistry {

    struct User {
        string firstName;
        string lastName;
        string birthday;
        string fileUploaded;
        string passportNo;
        address userAddress;
        uint256 balance;
    }

    struct Transaction {
        uint256 amount;
        uint256 tax;
        uint256 netAmount;
        uint256 timestamp;
    }

    mapping(bytes32 => User) private users;
    mapping(bytes32 => Transaction[]) private transactions;

    event UserRegistered(bytes32 indexed userId, address indexed userAddress);
    event DepositMade(bytes32 indexed userId, uint256 amount, uint256 tax, uint256 netAmount);

    uint256 public taxRate = 5; // Tax rate as a percentage

    // Utility function to construct DID from user's details
    function getUserId(string memory firstName, string memory lastName, string memory birthday) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(firstName, lastName, birthday));
    }

    // Register a new user
    function registerUser(
        string memory firstName,
        string memory lastName,
        string memory birthday,
        string memory fileUploaded,
        string memory passportNo
    ) public {
        bytes32 userId = getUserId(firstName, lastName, birthday);

        require(users[userId].userAddress == address(0), "User already registered");

        users[userId] = User({
            firstName: firstName,
            lastName: lastName,
            birthday: birthday,
            fileUploaded: fileUploaded,
            passportNo: passportNo,
            userAddress: msg.sender,
            balance: 0
        });

        emit UserRegistered(userId, msg.sender);
    }

    // Make a deposit and calculate tax
    function deposit(string memory firstName, string memory lastName, string memory birthday) public payable {
        bytes32 userId = getUserId(firstName, lastName, birthday);

        require(users[userId].userAddress != address(0), "User not registered");

        uint256 tax = (msg.value * taxRate) / 100;
        uint256 netAmount = msg.value - tax;

        users[userId].balance += netAmount;

        transactions[userId].push(Transaction({
            amount: msg.value,
            tax: tax,
            netAmount: netAmount,
            timestamp: block.timestamp
        }));

        emit DepositMade(userId, msg.value, tax, netAmount);
    }

    // Retrieve user details by DID
    function getUserDetails(string memory firstName, string memory lastName, string memory birthday) public view returns (User memory) {
        bytes32 userId = getUserId(firstName, lastName, birthday);
        require(users[userId].userAddress != address(0), "User not registered");
        return users[userId];
    }

    // Retrieve all transactions of a user by DID
    function getUserTransactions(string memory firstName, string memory lastName, string memory birthday) public view returns (Transaction[] memory) {
        bytes32 userId = getUserId(firstName, lastName, birthday);
        require(users[userId].userAddress != address(0), "User not registered");
        return transactions[userId];
    }
}

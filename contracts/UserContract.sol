// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract UserContract {
    struct User {
        string firstName;
        string lastName;
        string birthdate;
        string passportNo;
        uint256 balance;
    }

    mapping(address => User) public users;
    address public company;
    uint256 public companyBalance;
    uint256 public totalDeposited;
    uint256 public totalWithdrawn;

    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);

    modifier onlyCompany() {
        require(msg.sender == company, "Only the company can call this function");
        _;
    }

    constructor() {
        company = msg.sender;
    }

    event UserRegistered(address indexed user, string firstName, string lastName);

    function registerUser(
    string memory _firstName,
    string memory _lastName,
    string memory _birthdate,
    string memory _passportNo
    ) public {
    users[msg.sender] = User(_firstName, _lastName, _birthdate, _passportNo, 0);
    emit UserRegistered(msg.sender, _firstName, _lastName);
    }

    function deposit() public payable {
        require(msg.value > 0, "Deposit amount must be greater than zero");
        users[msg.sender].balance += msg.value;
        companyBalance += msg.value;
        totalDeposited += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint256 _amount) public {
        require(users[msg.sender].balance >= _amount, "Insufficient balance");
        users[msg.sender].balance -= _amount;
        companyBalance -= _amount;
        totalWithdrawn += _amount;
        payable(msg.sender).transfer(_amount);
        emit Withdraw(msg.sender, _amount);
    }

    function getBalance() public view returns (uint256) {
        return users[msg.sender].balance;
    }

    function getCompanyBalance() public view onlyCompany returns (uint256) {
        return companyBalance;
    }

    function getUserTransactions(address /* _user */) public view onlyCompany returns (uint256, uint256) {
        return (totalDeposited, totalWithdrawn);
    }
}

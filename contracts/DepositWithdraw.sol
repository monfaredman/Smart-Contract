// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;


contract DepositWithdraw {
    // Mapping to keep track of each user's balance
    mapping(address => uint256) private balances;

    // Event to log deposits
    event Deposit(address indexed user, uint256 amount);

    // Event to log withdrawals
    event Withdraw(address indexed user, uint256 amount);

    // Function to deposit Ether into the contract
    function deposit() public payable {
        require(msg.value > 0, "Deposit amount must be greater than zero");

        // Update the user's balance
        balances[msg.sender] += msg.value;

        // Emit the deposit event
        emit Deposit(msg.sender, msg.value);
    }

    // Function to withdraw Ether from the contract
    function withdraw(uint256 _amount) public {
        require(_amount > 0, "Withdraw amount must be greater than zero");
        require(balances[msg.sender] >= _amount, "Insufficient balance");

        // Update the user's balance
        balances[msg.sender] -= _amount;

        // Transfer the Ether to the user
        payable(msg.sender).transfer(_amount);

        // Emit the withdraw event
        emit Withdraw(msg.sender, _amount);
    }

    // Function to get the balance of the user
    function getBalance() public view returns (uint256) {
        return balances[msg.sender];
    }
    
}

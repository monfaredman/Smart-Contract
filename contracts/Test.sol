// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;



contract Test {
    string public name;

    constructor(string memory _name) {
        require(bytes(_name).length > 0, "Name must not be empty");
        name = _name;
    }
}
import React, { useState, useEffect } from "react";
import Web3 from "web3";
import UserContract from "../../build/contracts/UserContract.json";

const UserRegister = () => {
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    birthdate: "",
    passportNo: "",
  });
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState(0);
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        // Modern dapp browsers
        if (window.ethereum) {
          window.web3 = new Web3(window.ethereum);
          await window.ethereum.enable(); // Request account access if needed
        }
        // Legacy dapp browsers (e.g., Mist)
        else if (window.web3) {
          window.web3 = new Web3(window.web3.currentProvider);
        }
        // Non-dapp browsers
        else {
          console.log(
            "Non-Ethereum browser detected. You should consider trying MetaMask!"
          );
        }

        const web3 = window.web3;
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);

        const networkId = await web3.eth.net.getId();
        const deployedNetwork = UserContract.networks[networkId];
        const instance = new web3.eth.Contract(
          UserContract.abi,
          deployedNetwork && deployedNetwork.address
        );
        setContract(instance);
      } catch (error) {
        console.error("Error initializing web3: ", error);
      }
    };

    init();
  }, []);

  const handleRegister = async () => {
    await contract.methods
      .registerUser(
        userData.firstName,
        userData.lastName,
        userData.birthdate,
        userData.passportNo
      )
      .send({ from: account });
  };

  const handleDeposit = async () => {
    await contract.methods.deposit().send({
      from: account,
      value: web3.utils.toWei(amount.toString(), "ether"),
    });
  };

  const handleWithdraw = async () => {
    await contract.methods
      .withdraw(web3.utils.toWei(amount.toString(), "ether"))
      .send({ from: account });
  };

  const getBalance = async () => {
    const balance = await contract.methods.getBalance().call({ from: account });
    setBalance(web3.utils.fromWei(balance, "ether"));
  };

  return (
    <div className='App'>
      <h1>User Registration</h1>
      <input
        type='text'
        placeholder='First Name'
        value={userData.firstName}
        onChange={(e) =>
          setUserData({ ...userData, firstName: e.target.value })
        }
      />
      <input
        type='text'
        placeholder='Last Name'
        value={userData.lastName}
        onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
      />
      <input
        type='text'
        placeholder='Birthdate'
        value={userData.birthdate}
        onChange={(e) =>
          setUserData({ ...userData, birthdate: e.target.value })
        }
      />
      <input
        type='text'
        placeholder='Passport Number'
        value={userData.passportNo}
        onChange={(e) =>
          setUserData({ ...userData, passportNo: e.target.value })
        }
      />
      <button onClick={handleRegister}>Register</button>

      <h2>Deposit</h2>
      <input
        type='number'
        placeholder='Amount'
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button onClick={handleDeposit}>Deposit</button>

      <h2>Withdraw</h2>
      <input
        type='number'
        placeholder='Amount'
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button onClick={handleWithdraw}>Withdraw</button>

      <h2>Balance</h2>
      <button onClick={getBalance}>Get Balance</button>
      <p>{balance} ETH</p>
    </div>
  );
};

export default UserRegister;

import React, { useState, useEffect } from "react";
import {
  getContractInstance,
  getBalance,
  deposit,
  withdraw,
  disconnectAccount,
} from "../services/contract";
import Web3 from "web3";

const Contract: React.FC = () => {
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [contract, setContract] = useState<Web3["eth"]["Contract"] | null>(
    null
  );
  const [balance, setBalance] = useState<string>("0");
  const [amount, setAmount] = useState<string>("");

  useEffect(() => {
    const init = async () => {
      try {
        const { web3, accounts, contract } = await getContractInstance();
        setWeb3(web3);
        setAccount(accounts[0]);
        setContract(contract);
        const balance = await getBalance(contract, accounts[0]);
        // const etherBal = await web3.eth.getBalance(accounts[0]);

        setBalance(web3.utils.fromWei(balance, "ether"));
      } catch (error) {
        console.error("Initialization error:", error);
      }
    };

    init();
  }, []);

  // useEffect(() => {
  //   const init = async () => {
  //     try {
  //       const { web3, accounts, contract } = await getContractInstance();
  //       setWeb3(web3);
  //       setAccount(accounts[0]);
  //       setContract(contract);

  //       const contractBal = await getBalance(contract, accounts[0]);
  //       setContractBalance(web3.utils.fromWei(contractBal, 'ether'));

  //       const etherBal = await web3.eth.getBalance(accounts[0]);
  //       setEtherBalance(web3.utils.fromWei(etherBal, 'ether'));

  //       console.log('Contract balance:', contractBal);
  //       console.log('Ether balance:', etherBal);
  //     } catch (error) {
  //       console.error('Initialization error:', error);
  //     }
  //   };

  //   init();
  // }, []);

  const handleDeposit = async () => {
    if (web3 && contract && account && amount) {
      try {
        await deposit(web3, contract, account, amount);
        const newBalance = await getBalance(contract, account);
        setBalance(web3.utils.fromWei(newBalance, "ether"));
      } catch (error) {
        console.error("Error in handleDeposit:", error);
      }
    }
  };

  const handleWithdraw = async () => {
    if (web3 && contract && account && amount) {
      try {
        await withdraw(contract, account, web3.utils.toWei(amount, "ether"));
        const newBalance = await getBalance(contract, account);
        setBalance(web3.utils.fromWei(newBalance, "ether"));
      } catch (error) {
        console.error("Error in handleWithdraw:", error);
      }
    }
  };

  const handleDisconnect = () => {
    if (web3) {
      disconnectAccount(web3);
      setAccount(null);
      setContract(null);
      setWeb3(null);
    }
  };

  if (!web3 || !account || !contract) {
    return <div>Loading Web3, accounts, and contract...</div>;
  }

  return (
    <div>
      <h2>Deposit and Withdraw DApp</h2>
      <p>Your account: {account}</p>
      <p>Your balance in contract: {balance} ETH</p>
      <input
        type='text'
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder='Amount in ETH'
      />
      <button onClick={handleDeposit}>Deposit</button>
      <button onClick={handleWithdraw}>Withdraw</button>
      <button onClick={handleDisconnect}>Disconnect</button>
    </div>
  );
};

export default Contract;

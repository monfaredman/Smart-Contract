import Web3 from "web3";
import { Contract } from "web3-eth-contract";
import DepositWithdraw from "../../build/contracts/DepositWithdraw.json";
import getWeb3 from "./web3";

interface ContractInstance {
  web3: Web3;
  accounts: string[];
  contract: Contract;
}

const getContractInstance = async (): Promise<ContractInstance> => {
  try {
    const web3 = await getWeb3();

    if (!web3) {
      throw new Error(
        "Web3 instance is not available. Please check if Metamask or another Ethereum provider is installed."
      );
    }

    const accounts = await web3.eth.getAccounts();
    const networkId = await web3.eth.net.getId();

    if (!DepositWithdraw.networks[networkId]) {
      throw new Error(`Contract not deployed on network with id ${networkId}`);
    }

    const contractAddress = DepositWithdraw.networks[networkId].address;
    const contract = new web3.eth.Contract(
      DepositWithdraw.abi as any[],
      contractAddress
    );

    return { web3, accounts, contract };
  } catch (error) {
    console.error("Error in getContractInstance:", error.message);
    throw error;
  }
};

const getBalance = async (
  contract: Contract,
  account: string
): Promise<string> => {
  try {
    const balance = await contract.methods.getBalance().call({ from: account });
    return balance;
  } catch (error) {
    console.error("Error in getBalance:", error.message);
    throw error;
  }
};

const deposit = async (
  web3: Web3,
  contract: Contract,
  account: string,
  amountInEther: string
) => {
  try {
    const amount = web3.utils.toWei(amountInEther, "ether");
    const gasPrice = await web3.eth.getGasPrice();
    const gasEstimate = await contract.methods
      .deposit()
      .estimateGas({ from: account, value: amount });

    await contract.methods
      .deposit()
      .send({ from: account, value: amount, gas: gasEstimate, gasPrice });
  } catch (error) {
    if (error.message.includes("insufficient funds for gas * price + value")) {
      console.error(
        "Insufficient funds: Make sure your account has enough ETH to cover the value and gas fees."
      );
    } else {
      console.error("Error in deposit:", error.message);
    }
    throw error;
  }
};

const withdraw = async (
  contract: Contract,
  account: string,
  amount: string
): Promise<void> => {
  try {
    await contract.methods.withdraw(amount).send({ from: account });
  } catch (error) {
    console.error("Error in withdraw:", error.message);
    throw error;
  }
};

const disconnectAccount = (web3: Web3): void => {
  try {
    if (web3.currentProvider && (web3.currentProvider as any).disconnect) {
      (web3.currentProvider as any).disconnect();
      console.log("Disconnected from account.");
    } else {
      console.warn("Current provider does not support disconnecting.");
    }
  } catch (error) {
    console.error("Error in disconnectAccount:", error.message);
  }
};

export {
  getContractInstance,
  getBalance,
  deposit,
  withdraw,
  disconnectAccount,
};

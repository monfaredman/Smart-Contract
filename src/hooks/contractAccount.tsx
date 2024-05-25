import { useEffect, useState } from "react";
import { ethers, JsonRpcProvider } from "ethers";
import { toast } from "react-toastify";
import UserContract from "~/build/contracts/UserRegistration.json";

const alchemyApiKeyUrl: string = `https://eth-holesky.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_API_KEY}`;

export const useContractInstance = (signer: ethers.Signer | null) => {
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    const init = async () => {
      if (!signer) return;

      try {
        const provider = new JsonRpcProvider(alchemyApiKeyUrl);
        const network = await provider.getNetwork();
        const networkId = network.chainId;
        const deployedNetwork = UserContract.networks[networkId];
        if (deployedNetwork) {
          const instance = new ethers.Contract(
            deployedNetwork.address,
            UserContract.abi,
            signer
          );
          setContract(instance);
        } else {
          toast.error("Contract not deployed on the detected network.");
        }
      } catch (error: any) {
        toast.error(error.message);
      }
    };

    init();
  }, [signer]);

  return contract;
};

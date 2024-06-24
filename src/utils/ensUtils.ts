import { isValidName, ethers } from "ethers";
import { createPublicClient, http } from 'viem';
import { addEnsContracts } from '@ensdomains/ensjs';
import { getOwner } from '@ensdomains/ensjs/public';
import { mainnet, sepolia, optimism } from 'viem/chains';

const validateEns = async (ens: string, setEnsError: Function, account: string, chainId: number): Promise<boolean> => {
    if (!isValidName(ens)) {
        setEnsError("Invalid ENS name");
        return false;
    }

    const isEnsNameOwned = await isAccountOwnerOfEnsName(ens, account, setEnsError, chainId);

    if (!isEnsNameOwned) {
        return false;
    }

    return true;
}

const validateRpc = (rpc: string, setRpcError: Function): boolean => {
    try {

        if (!rpc.length) {
            setRpcError("Invalid RPC endpoint");
            return false;
        }

        const validatedUrl = new URL(rpc);

        if (validatedUrl.protocol !== "https:") {
            setRpcError("RPC endpoint must start with https");
            return false;
        }

        new ethers.JsonRpcProvider(rpc);
        return true;

    } catch (error) {
        console.log("Error in RPC node : ", error);
        setRpcError("Invalid RPC endpoint");
        return false;
    }
}

const validateUrl = (url: string, setUrlError: Function): boolean => {
    try {

        const validatedUrl = new URL(url);

        if (validatedUrl.protocol !== "https:") {
            setUrlError("URL endpoint must start with https");
            return false;
        }

        return true;

    } catch (error) {
        setUrlError("Invalid URL endpoint");
        return false;
    }
}

export const areAllPropertiesValid = async (
    ens: string,
    setEnsError: Function,
    rpc: string,
    setRpcError: Function,
    url: string,
    setUrlError: Function,
    account: string,
    chainId: number,
): Promise<boolean> => {
    const isEnsValid = await validateEns(ens, setEnsError, account, chainId);
    const isRpcValid = validateRpc(rpc, setRpcError);
    const isUrlValid = validateUrl(url, setUrlError);
    return (isEnsValid && isRpcValid && isUrlValid);
}

const isAccountOwnerOfEnsName = async (
    ensName: string,
    account: string,
    setEnsError: Function,
    chainId: number,
): Promise<boolean> => {

    try {

        const chain = chainId === 1 ? mainnet : (chainId === 10 ? optimism : sepolia);

        const client = createPublicClient({
            chain: addEnsContracts(chain),
            transport: http(),
        });

        const result = await getOwner(client, { name: ensName });

        if (result && result.owner && result.owner.toLowerCase() === account.toLowerCase()) {
            console.log("You are not the owner of ens name : ", result)
            return true;
        }

        setEnsError("You are not the owner of this name");
        return false;

    } catch (error) {
        console.log("Error in validating ens name : ", error);
        setEnsError("You are not the owner of this name");
        return false;
    }

};
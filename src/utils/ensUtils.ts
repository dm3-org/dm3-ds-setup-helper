import { isValidName, ethers, JsonRpcProvider } from "ethers";

const validateEns = async (provider: JsonRpcProvider, ens: string, setEnsError: Function, account: string): Promise<boolean> => {
    if (!isValidName(ens)) {
        setEnsError("Invalid ENS name");
        return false;
    }
    const isEnsNameOwned = await isEnsNameRegistered(provider, ens, account, setEnsError);
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
            setUrlError("URL endpoint must be https");
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
    provider: JsonRpcProvider
): Promise<boolean> => {
    const isEnsValid = await validateEns(provider, ens, setEnsError, account);
    const isRpcValid = validateRpc(rpc, setRpcError);
    const isUrlValid = validateUrl(url, setUrlError);
    return (isEnsValid && isRpcValid && isUrlValid);
}

const isEnsNameRegistered = async (
    mainnetProvider: JsonRpcProvider,
    ensName: string,
    account: string,
    setEnsError: Function
): Promise<boolean> => {

    try {
        const resolver = await mainnetProvider.getResolver(ensName);

        if (resolver === null) {
            setEnsError("Resolver not found");
            return false;
        }

        console.log(resolver);

        const owner = await mainnetProvider.resolveName(ensName);

        if (!owner || owner.toLowerCase() !== account.toLowerCase()) {
            setEnsError("You are not the owner/manager of this name");
            return false;
        }

        return true;
    } catch (error) {
        console.log("Error in validating ens name : ", error);
        setEnsError("You are not the owner/manager of this name");
        return false;
    }

};
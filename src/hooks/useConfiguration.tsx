import { useEffect, useState } from "react";
import { namehash, normalize } from "viem/ens";
import { resolverAbi } from "../utils/resolverAbi";
import { configureEnv } from "../utils/configureEnv";
import { configurationTemplate } from "../utils/configurationTemplate";
import { useAccount, useEnsResolver, useSignMessage, useWriteContract } from "wagmi";
import { DeliveryServiceProfile, DeliveryServiceProfileKeys } from "@dm3-org/dm3-lib-profile";
import { createKeyPair, createSigningKeyPair, createStorageKey } from "@dm3-org/dm3-lib-crypto";
import { CONFIG_FILE_NAME, DELIVERY_SERVICE, ENV_FILE_NAME, KEY_CREATION_MESSAGE, ZERO_ADDRESS } from "../utils/constants";

export const useConfiguration = () => {

    const [ensInput, setEnsInput] = useState<string>("");
    const [ensDomain, setEnsDomain] = useState<string>("");

    const [url, setUrl] = useState<string>("");
    const [rpc, setRpc] = useState<string>("");

    const [keys, setKeys] = useState<DeliveryServiceProfileKeys>();
    const [profile, setProfile] = useState<DeliveryServiceProfile>();

    const [ensResolverFound, setEnsResolverFound] = useState<boolean>(false);
    const [keyCreationMessage, setKeyCreationMessage] = useState<string>("");
    const [profileAndKeysCreated, setProfileAndKeysCreated] = useState<boolean>(false);

    const { isConnected, address } = useAccount();

    const {
        data: signMessageData,
        error,
        signMessage,
        variables,
    } = useSignMessage();

    const {
        data: ensResolver,
        isError,
        isLoading: ensResolverIsLoading,
    } = useEnsResolver({ name: normalize(ensDomain) });

    const {
        data: hash,
        writeContract,
        isPending: writeContractIsPending,
        error: writeContractError,
    } = useWriteContract();

    const handleEnsChange = (
        event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
    ) => {
        setEnsInput(event.target.value);
    };

    const handleUrlChange = (
        event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
    ) => {
        setUrl(event.target.value);
    };

    const handleRpcChange = (
        event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
    ) => {
        setRpc(event.target.value);
    };

    function createConfigAndProfile() {
        // todo: check if ens is valid
        setEnsDomain(ensInput);
        const dsEnsAndUrl = JSON.stringify({
            ens: ensDomain,
            url: url,
        });
        const _keyCreationMessage = KEY_CREATION_MESSAGE + dsEnsAndUrl;
        setKeyCreationMessage(KEY_CREATION_MESSAGE + dsEnsAndUrl);
        signMessage({ message: _keyCreationMessage });
    }

    function storeEnv() {
        if (!keys) {
            alert("keys are missing");
            return;
        }

        const env = configureEnv(keys, rpc, ensDomain, url, address as string,
            keyCreationMessage, profile as DeliveryServiceProfile);
        const blob = new Blob([env], { type: "text/plain" });
        const buttonUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = ENV_FILE_NAME;
        link.href = buttonUrl;
        link.click();
    }

    function storeConfig() {
        const blob = new Blob([configurationTemplate], { type: "text/plain" });
        const buttonUrl = URL.createObjectURL(blob);
        const buttonLink = document.createElement("a");
        buttonLink.download = CONFIG_FILE_NAME;
        buttonLink.href = buttonUrl;
        buttonLink.click();
    }

    function publishProfile() {
        if (ensResolver) {
            // console.log("checking ens domain controller");
            // const { data: balance } = useReadContract({
            //   ...wagmiContractConfig,
            //   functionName: "balanceOf",
            //   args: ["0x03A71968491d55603FFe1b11A9e23eF013f75bCF"],
            // });
            console.log("publishing profile");
            writeContract({
                address: ensResolver,
                abi: resolverAbi,
                functionName: "setText",
                args: [
                    namehash(ensDomain),
                    DELIVERY_SERVICE,
                    JSON.stringify(profile),
                ],
            });
            console.log("published profile");
            console.log("transaction hash: ", hash);
        } else {
            alert(`ensResolver is missing`);
        }
    }

    useEffect(() => { }, [address]);

    useEffect(() => {
        if (isError && !ensResolverIsLoading) {
            console.log("error: ", error);
            setEnsResolverFound(false);
        }
        if (
            !isError &&
            !ensResolverIsLoading &&
            ensResolver !== ZERO_ADDRESS
        ) {
            console.log("ens resolver found: ", ensResolver);
            setEnsResolverFound(true);
        }
    }, [ensResolver, isError, ensResolverIsLoading, error]);

    useEffect(() => {
        (async () => {
            if (variables?.message && signMessageData) {
                const keys: DeliveryServiceProfileKeys = {
                    encryptionKeyPair: await createKeyPair(
                        await createStorageKey(signMessageData)
                    ),
                    signingKeyPair: await createSigningKeyPair(
                        await createStorageKey(signMessageData)
                    ),
                };

                const profile: DeliveryServiceProfile = {
                    publicEncryptionKey: keys.encryptionKeyPair.publicKey,
                    publicSigningKey: keys.signingKeyPair.publicKey,
                    url: url,
                };

                setProfile(profile);
                setKeys(keys);
                setProfileAndKeysCreated(true);
            }
        })();
    }, [signMessageData, variables?.message, url]);

    return {
        address,
        handleEnsChange,
        handleUrlChange,
        handleRpcChange,
        isConnected,
        createConfigAndProfile,
        profileAndKeysCreated,
        storeEnv,
        storeConfig,
        profile,
        writeContractIsPending,
        ensResolverFound,
        publishProfile,
        hash,
        writeContractError
    };

}
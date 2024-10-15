import { useEffect, useState } from 'react';
import { namehash, normalize } from 'viem/ens';
import { resolverAbi } from '../utils/resolverAbi';
import { configureEnv } from '../utils/configureEnv';
import {
    areAllPropertiesValid,
    isAccountOwnerOfEnsName,
    validateEns,
} from '../utils/ensUtils';
import {
    useAccount,
    useChainId,
    useEnsResolver,
    useSignMessage,
    useWriteContract,
} from 'wagmi';
import {
    DeliveryServiceProfile,
    DeliveryServiceProfileKeys,
} from '@dm3-org/dm3-lib-profile';
import {
    createKeyPair,
    createSigningKeyPair,
    createStorageKey,
} from '@dm3-org/dm3-lib-crypto';
import {
    DELIVERY_SERVICE,
    ENV_FILE_NAME,
    KEY_CREATION_MESSAGE,
    PROFILE_PREFIX,
    ZERO_ADDRESS,
} from '../utils/constants';

export const useConfiguration = () => {
    // ens domain for profile
    const [ensDomain, setEnsDomain] = useState<string>('');

    // create profile
    const [ensInput, setEnsInput] = useState<string>('');
    const [url, setUrl] = useState<string>('');
    const [rpc, setRpc] = useState<string>('');

    // created profile & keys
    const [keys, setKeys] = useState<DeliveryServiceProfileKeys>();
    const [profile, setProfile] = useState<DeliveryServiceProfile>();

    // publish profile
    const [userProfile, setUserProfile] = useState<string>('');
    const [userEns, setUserEns] = useState<string>('');

    const [ensResolverFound, setEnsResolverFound] = useState<boolean>(false);
    const [keyCreationMessage, setKeyCreationMessage] = useState<string>('');
    const [profileAndKeysCreated, setProfileAndKeysCreated] =
        useState<boolean>(false);

    // errors
    const [ensError, setEnsError] = useState<string | null>(null);
    const [urlError, setUrlError] = useState<string | null>(null);
    const [rpcError, setRpcError] = useState<string | null>(null);
    const [ensOwnershipError, setEnsOwnershipError] = useState<string | null>(
        null,
    );
    const [userProfileError, setUserProfileError] = useState<string | null>(
        null,
    );
    const [userEnsError, setUserEnsError] = useState<string | null>(null);

    // connected chain
    const chainId = useChainId();

    // connected account
    const { isConnected, address, connector } = useAccount();

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
        reset, // resets the state of write contract hook
    } = useWriteContract();

    const handleEnsChange = (
        event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
    ) => {
        setEnsInput(event.target.value);
        setEnsError(null);
    };

    const handleUrlChange = (
        event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
    ) => {
        setUrl(event.target.value);
        setUrlError(null);
    };

    const handleRpcChange = (
        event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
    ) => {
        setRpc(event.target.value);
        setRpcError(null);
    };

    const handleUserProfileChange = (
        event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
    ) => {
        setUserProfile(event.target.value);
        setUserProfileError(null);
        reset();
    };

    const handleUserEnsChange = (
        event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
    ) => {
        const ensValue = event.target.value;
        setUserEns(ensValue);
        setUserEnsError(null);
        setEnsOwnershipError(null);
        reset();
        // sets ENS domain to get the resolver if ens name is valid
        if (validateEns(ensValue)) {
            setEnsDomain(ensValue);
        }
    };

    const createConfigAndProfile = async () => {
        const isValid = await areAllPropertiesValid(
            ensInput,
            setEnsError,
            rpc,
            setRpcError,
            url,
            setUrlError,
        );
        if (!isValid) {
            return;
        }
        setEnsDomain(ensInput);
        const dsEnsAndUrl = JSON.stringify({
            ens: ensInput,
            url: url,
        });
        const _keyCreationMessage = KEY_CREATION_MESSAGE + dsEnsAndUrl;
        setKeyCreationMessage(KEY_CREATION_MESSAGE + dsEnsAndUrl);
        signMessage({ message: _keyCreationMessage });
    };

    const storeEnv = () => {
        if (!keys) {
            alert('keys are missing');
            return;
        }

        const env = configureEnv(
            keys,
            rpc,
            ensDomain,
            url,
            address as string,
            keyCreationMessage,
            profile as DeliveryServiceProfile,
        );
        const blob = new Blob([env], { type: 'text/plain' });
        const buttonUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = ENV_FILE_NAME;
        link.href = buttonUrl;
        link.click();
    };

    const validateProfile = (): boolean => {
        try {
            if (!userProfile.length) {
                setUserProfileError('Invalid profile data');
                return false;
            }

            const jsonProfile = JSON.parse(userProfile);

            if (
                !jsonProfile.publicEncryptionKey ||
                !jsonProfile.publicSigningKey ||
                !jsonProfile.url
            ) {
                setUserProfileError('Invalid profile data');
                return false;
            }

            return true;
        } catch (error) {
            console.log('Invalid profile data : ', error);
            setUserProfileError('Invalid profile data');
            return false;
        }
    };

    const publishProfile = async () => {
        // validate ens name
        const isEnsValid = validateEns(userEns, setUserEnsError);

        if (!isEnsValid) {
            return;
        }

        // validate user profile data
        const isProfileValid = validateProfile();

        if (!isProfileValid) {
            return;
        }

        // validate the ens name access to add text records
        const isEnsNameOwner = await isAccountOwnerOfEnsName(
            userEns,
            address as string,
            setEnsOwnershipError,
            chainId,
        );

        if (!isEnsNameOwner) {
            return;
        }

        // Profile data to publish on ENS
        const profileData = PROFILE_PREFIX.concat(userProfile);

        if (ensResolver) {
            console.log('publishing profile');
            writeContract({
                address: ensResolver,
                abi: resolverAbi,
                functionName: 'setText',
                args: [namehash(ensDomain), DELIVERY_SERVICE, profileData],
            });
            console.log('published profile');
            console.log('transaction hash: ', hash);
        } else {
            alert(`ensResolver is missing`);
        }
    };

    // clears all input field & error on change of account
    useEffect(() => {
        console.log('Account changed : ', address);
        setEnsInput('');
        setRpc('');
        setUrl('');
        setUserEns('');
        setUserProfile('');
        setEnsError(null);
        setRpcError(null);
        setUrlError(null);
        setUserEnsError(null);
        setUserProfileError(null);
        setEnsOwnershipError(null);
        setProfile(undefined);
        setKeys(undefined);
        reset();
    }, [address, reset]);

    useEffect(() => {
        if (isError && !ensResolverIsLoading) {
            console.log('error: ', error);
            setEnsResolverFound(false);
        }
        if (!isError && !ensResolverIsLoading && ensResolver !== ZERO_ADDRESS) {
            console.log('ens resolver found: ', ensResolver);
            setEnsResolverFound(true);
        }
    }, [ensResolver, isError, ensResolverIsLoading, error]);

    useEffect(() => {
        (async () => {
            if (variables?.message && signMessageData) {
                const keys: DeliveryServiceProfileKeys = {
                    encryptionKeyPair: await createKeyPair(
                        await createStorageKey(signMessageData),
                    ),
                    signingKeyPair: await createSigningKeyPair(
                        await createStorageKey(signMessageData),
                    ),
                };

                const profile: DeliveryServiceProfile = {
                    publicEncryptionKey: keys.encryptionKeyPair.publicKey,
                    publicSigningKey: keys.signingKeyPair.publicKey,
                    url: url,
                };

                setProfile(profile);
                setUserProfile(JSON.stringify(profile));
                setKeys(keys);
                setProfileAndKeysCreated(true);
                setUserEns(ensInput);
            }
        })();
    }, [signMessageData, variables?.message, url, ensInput]);

    return {
        address,
        handleEnsChange,
        handleUrlChange,
        handleRpcChange,
        isConnected,
        createConfigAndProfile,
        profileAndKeysCreated,
        storeEnv,
        profile,
        writeContractIsPending,
        ensResolverFound,
        publishProfile,
        hash,
        writeContractError,
        ensError,
        urlError,
        rpcError,
        connector,
        ensInput,
        url,
        rpc,
        ensOwnershipError,
        setEnsOwnershipError,
        userProfile,
        userProfileError,
        handleUserProfileChange,
        userEns,
        userEnsError,
        handleUserEnsChange,
    };
};

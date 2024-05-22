import {
  createKeyPair,
  createSigningKeyPair,
  createStorageKey,
} from "@dm3-org/dm3-lib-crypto";
import {
  DeliveryServiceProfile,
  DeliveryServiceProfileKeys,
} from "@dm3-org/dm3-lib-profile";
import { ConnectButton, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { useEffect, useState } from "react";
import { recoverMessageAddress } from "viem";
import { namehash, normalize } from "viem/ens";
import {
  useAccount,
  useEnsResolver,
  useSignMessage,
  useWriteContract,
} from "wagmi";
import * as YAML from "yaml";
import { resolverAbi } from "./resolverAbi";

const App = () => {
  const [ensInput, setEnsInput] = useState("");
  const [ensDomain, setEnsDomain] = useState("");
  const [url, setUrl] = useState("url");
  const [profile, setProfile] = useState<DeliveryServiceProfile>();
  const [keys, setKeys] = useState<DeliveryServiceProfileKeys>();
  const [profileAndKeysCreated, setProfileAndKeysCreated] = useState(false);
  const [ensResolverFound, setEnsResolverFound] = useState(false);
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

  useEffect(() => {}, [address]);

  useEffect(() => {
    if (isError && !ensResolverIsLoading) {
      console.log("error: ", error);
      setEnsResolverFound(false);
    }
    if (
      !isError &&
      !ensResolverIsLoading &&
      ensResolver != "0x0000000000000000000000000000000000000000"
    ) {
      console.log("ens resolver found: ", ensResolver);
      setEnsResolverFound(true);
    }
  }, [ensResolver, isError, ensResolverIsLoading]);

  useEffect(() => {
    (async () => {
      if (variables?.message && signMessageData) {
        const signature = signMessageData;
        const recoveredAddress = await recoverMessageAddress({
          message: variables?.message,
          signature: signature,
        });

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
  }, [signMessageData, variables?.message]);

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

  function createConfigAndProfile() {
    // todo: check if ens is valid
    setEnsDomain(ensInput);
    const dsEnsAndUrl = JSON.stringify({
      ens: ensDomain,
      url: url,
    });
    signMessage({
      message:
        "I am creating the seed for a dm3 delivery service profile by signing this message." +
        dsEnsAndUrl,
    });
  }

  function storeProfile() {
    const fileData = YAML.stringify(profile);
    const blob = new Blob([fileData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = "dm3-delivery-service-profile_PUBLIC.yml";
    link.href = url;
    link.click();
  }

  function storeConfig() {
    const config = { ...keys, ens: ensInput, rpc: url };
    const fileData = YAML.stringify(config);
    const blob = new Blob([fileData], { type: "text/plain" });
    const buttonUrl = URL.createObjectURL(blob);
    const buttonLink = document.createElement("a");
    buttonLink.download = "dm3-delivery-service-config_PRIVATE.yml";
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
          "network.dm3.deliveryService",
          JSON.stringify(profile),
        ],
      });
      console.log("published profile");
      console.log("transaction hash: ", hash);
    } else {
      alert(`ensResolver is missing`);
    }
  }

  return (
    <RainbowKitProvider>
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            padding: 12,
          }}
        >
          <ConnectButton />
        </div>
        <div>
          <h1>Welcome {address}</h1>
          <div>
            <h2>Step 1: create config and profile</h2>
            To create the profile and config file, please connect the account
            the delivery service will use. Also, we need this information:
            <p>
              ENS:
              <input onChange={(event) => handleEnsChange(event)}></input>
            </p>
            <p>
              URL:
              <input onChange={(event) => handleUrlChange(event)}></input>
            </p>
            <div>
              <button disabled={!isConnected} onClick={createConfigAndProfile}>
                Create config and profile
              </button>
            </div>
          </div>
          <div>
            <h2>Step 2: store config and profile</h2>
            <button disabled={!profileAndKeysCreated} onClick={storeProfile}>
              Store profile file
            </button>
            {/* <p>{recoveredAddress.length > 0 ? recoveredAddress : ""}</p> */}
            <button disabled={!profileAndKeysCreated} onClick={storeConfig}>
              Store config
            </button>
          </div>
        </div>
        <div>
          <h2>Step 3: publish profile</h2>
          Now, please connect the account that controls the ENS domain so we can
          publish the profile.
          {/* <p>Resolver: {ensResolverIsLoading ? "" : resolver}</p> */}
          <p>
            Write contract state: {writeContractIsPending ? "pending" : "done"}
          </p>
          <p>
            Profile:{" "}
            {profileAndKeysCreated
              ? JSON.stringify(profile)
              : "Finish step 1 first"}
            Keys:{" "}
            {profileAndKeysCreated
              ? JSON.stringify(keys)
              : "Finish step 1 first"}
          </p>
          <button
            disabled={!profileAndKeysCreated || !ensResolverFound}
            onClick={publishProfile}
          >
            Publish profile
          </button>
          <p>{hash && hash}</p>
          <p>{writeContractError && JSON.stringify(writeContractError)}</p>
          {/* <p>
            load profile from file (optional):
            <input type="file" />
          </p> */}
        </div>
      </div>
    </RainbowKitProvider>
  );
};

export default App;

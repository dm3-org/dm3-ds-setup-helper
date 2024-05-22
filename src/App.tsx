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
  const [keyCreationMessage, setKeyCreationMessage] = useState("");
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
    setKeyCreationMessage(
      "I am creating the seed for a dm3 delivery service profile by signing this message." +
        dsEnsAndUrl
    );
    signMessage({
      message: keyCreationMessage,
    });
  }

  function storeEnv() {
    const env =
      "SIGNING_PUBLIC_KEY={keys.signingKeyPair.publicKey}\n" +
      "SIGNING_PRIVATE_KEY={keys.signingKeyPair.privateKey}\n" +
      "ENCRYPTION_PUBLIC_KEY={keys.encryptionKeyPair.publicKey}\n" +
      "ENCRYPTION_PRIVATE_KEY={keys.encryptionKeyPair.privateKey}\n" +
      "RPC=<please input rpc url here>\n" +
      "# the following information is only included for convenience, it is not used by the delivery service\n" +
      "# ENS_DOMAIN={ensDomain}\n" +
      "# URL={url}\n" +
      "# ACCOUNT_USED_FOR_KEY_CREATION={address}\n" +
      "# MESSAGE_USED_FOR_KEY_CREATION={message}\n" +
      "# PROFILE={JSON.stringify(profile)}\n";

    const fileData = YAML.stringify(env);
    const blob = new Blob([fileData], { type: "text/plain" });
    const buttonUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = "dm3-delivery-service-environment";
    link.href = buttonUrl;
    link.click();
  }

  function storeConfig() {
    const configTemplate =
      "# the delivery service configuration file" +
      "\n" +
      "# message time to live in seconds. The delivery service promises to keep the message for at least this long. \n" +
      "# 15811200 is 6 months\n" +
      "messageTTL: 15811200\n" +
      "\n" +
      "# the maximum size of a message in bytes, 10000000 is roughly 10MB \n" +
      "sizeLimit: 10000000\n" +
      "\n" +
      "# uncomment the next block and replace all placeholders with your information in order to enable email notifications\n" +
      "#notificationChannel:\n" +
      "# - type: EMAIL\n" +
      "#   config:\n" +
      "#    smtpHost: <place your email provider's url here, e.g. smtp.gmail.com>\n" +
      "#    smtpPort: <place your port here, default is 587>\n" +
      "#    smtpEmail: <place the email address here>\n" +
      "#    smtpUsername: <place your user name here>\n" +
      "#    smtpPassword: <place your password here>\n";
    const blob = new Blob([configTemplate], { type: "text/plain" });
    const buttonUrl = URL.createObjectURL(blob);
    const buttonLink = document.createElement("a");
    buttonLink.download = "dm3-delivery-service-config.yml";
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
              (the ens domain your delivery service will use, e.g.
              myPersonalDeliveryService.eth)
            </p>
            <p>
              URL:
              <input onChange={(event) => handleUrlChange(event)}></input>
              (the url your delivery service will use, e.g.
              https://my-personal-delivery-service.com)
            </p>
            <div>
              <button disabled={!isConnected} onClick={createConfigAndProfile}>
                Create profile and .env
              </button>
            </div>
          </div>
          <div>
            <h2>Step 2: store .env</h2>

            <button disabled={!profileAndKeysCreated} onClick={storeEnv}>
              Store .env
            </button>
          </div>
        </div>
        <div>
          <h2>Step 3: publish profile</h2>
          Now, please connect the account that controls the ENS domain so we can
          publish the profile.
          <p>
            {profileAndKeysCreated && "Profile: " + JSON.stringify(profile)}
          </p>
          <p>
            Write contract state: {writeContractIsPending ? "pending" : "done"}
          </p>
          <button
            disabled={!profileAndKeysCreated || !ensResolverFound}
            onClick={publishProfile}
          >
            Publish profile
          </button>
          <p>{hash && hash}</p>
          <p>{writeContractError && JSON.stringify(writeContractError)}</p>
        </div>
        <div>
          <h2>Step 4: store config template</h2>
          <p>{profileAndKeysCreated && "Keys: " + JSON.stringify(keys)}</p>
          <button onClick={storeConfig}>Store config template</button>
        </div>
      </div>
    </RainbowKitProvider>
  );
};

export default App;

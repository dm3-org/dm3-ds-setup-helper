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
import { namehash, normalize } from "viem/ens";
import {
  useAccount,
  useEnsResolver,
  useSignMessage,
  useWriteContract,
} from "wagmi";
import { resolverAbi } from "./resolverAbi";

const App = () => {
  const CONFIG_FILE_NAME = "config.yml";
  const ENV_FILE_NAME = ".env";
  const DOCKER_COMPOSE_DOWNLOAD_URL =
    "https://raw.githubusercontent.com/dm3-org/dm3/develop/docker/ds-minimal/docker-compose.yml";
  const [ensInput, setEnsInput] = useState("");
  const [ensDomain, setEnsDomain] = useState("");
  const [url, setUrl] = useState("");
  const [rpc, setRpc] = useState("");
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
      ensResolver !== "0x0000000000000000000000000000000000000000"
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
    const _keyCreationMessage =
      "I am creating the seed for a dm3 delivery service profile by signing this message." +
      dsEnsAndUrl;
    setKeyCreationMessage(
      "I am creating the seed for a dm3 delivery service profile by signing this message." +
        dsEnsAndUrl
    );
    signMessage({
      message: _keyCreationMessage,
    });
  }

  function storeEnv() {
    if (!keys) {
      alert("keys are missing");
      return;
    }
    const env =
      "SIGNING_PUBLIC_KEY=" +
      keys.signingKeyPair.publicKey +
      "\n" +
      "SIGNING_PRIVATE_KEY=" +
      keys.signingKeyPair.privateKey +
      "\n" +
      "ENCRYPTION_PUBLIC_KEY=" +
      keys.encryptionKeyPair.publicKey +
      "\n" +
      "ENCRYPTION_PRIVATE_KEY=" +
      keys.encryptionKeyPair.privateKey +
      "\n" +
      "RPC=" +
      rpc +
      "\n" +
      "# the following information is only included for convenience, it is not used by the delivery service\n" +
      "# ENS_DOMAIN=" +
      ensDomain +
      "\n" +
      "# URL=" +
      url +
      "\n" +
      "# ACCOUNT_USED_FOR_KEY_CREATION=" +
      address +
      "\n" +
      "# MESSAGE_USED_FOR_KEY_CREATION=" +
      keyCreationMessage +
      "\n" +
      "# PROFILE=" +
      JSON.stringify(profile) +
      "\n";

    const blob = new Blob([env], { type: "text/plain" });
    const buttonUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = ENV_FILE_NAME;
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
            This web app will help you to set up a dm3 delivery service. You can
            do steps 1 and 2 (generating and saving your keys) offline. The last
            steps need an internet connection, as they execute a transaction on
            the ethereum blockchain and download stuff.{" "}
          </div>
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
            <p>
              RPC:
              <input onChange={(event) => handleRpcChange(event)}></input>
              (the rpc url your delivery service will use, e.g.
              https://mainnet.infura.io/v3/f02ijf0283i0jq0jdoisjd07829)
            </p>
            <div>
              <button disabled={!isConnected} onClick={createConfigAndProfile}>
                Create profile and .env
              </button>
            </div>
          </div>
          <div>
            <h2>Step 2: store .env and config.yml</h2>
            <button disabled={!profileAndKeysCreated} onClick={storeEnv}>
              Store .env
            </button>{" "}
            <button onClick={storeConfig}>Store default config</button>
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
          <h2>Step 4: </h2>
          <ol>
            <li>
              Download{" "}
              <a href={DOCKER_COMPOSE_DOWNLOAD_URL} target="_blank">
                the docker compose file
              </a>{" "}
              and save it as docker-compose.yml
            </li>
            <li>
              move all 3 files (docker-compose.yml, .env, config.yml) into a
              directory on the machine you want to run the service on (e.g. a
              web server)
            </li>
            <li>
              in this directory, execute `docker-compose up -d` to start the
              delivery service
            </li>
            <li>
              visit &lt;yourUrl&gt;:8083/hello with your web browser to get a
              first friendly response from your delivery service
            </li>
          </ol>
        </div>
        <div>
          Info: This tool is provided as is under the{" "}
          <a href="https://github.com/dm3-org/dm3-ds-setup-helper/blob/main/LICENSE">
            BSD 2-Clause License
          </a>
          . You can find the source code, open issues and contribute{" "}
          <a href="https://github.com/dm3-org/dm3-ds-setup-helper">here.</a>{" "}
        </div>
      </div>
    </RainbowKitProvider>
  );
};

export default App;

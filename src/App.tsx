import { ConnectButton, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { useEffect, useState } from "react";
import { recoverMessageAddress } from "viem";
import { useAccount, useSignMessage } from "wagmi";
import {
  createKeyPair,
  createSigningKeyPair,
  createStorageKey,
} from "@dm3-org/dm3-lib-crypto";
import {
  DeliveryServiceProfile,
  DeliveryServiceProfileKeys,
} from "@dm3-org/dm3-lib-profile";
import * as YAML from "yaml";

const App = () => {
  const [ens, setEns] = useState("ens");
  const [url, setUrl] = useState("url");
  const [profile, setProfile] = useState<DeliveryServiceProfile>();
  const [keys, setKeys] = useState<DeliveryServiceProfileKeys>();
  const [profileAndKeysCreated, setProfileAndKeysCreated] = useState(false);
  const [signature, setSignature] = useState("");
  const [recoveredAddress, setRecoveredAddress] = useState("");
  const { isConnected, address } = useAccount();
  const {
    data: signMessageData,
    error,
    signMessage,
    variables,
  } = useSignMessage();

  useEffect(() => {
    (async () => {
      if (variables?.message && signMessageData) {
        const signature = signMessageData;
        const recoveredAddress = await recoverMessageAddress({
          message: variables?.message,
          signature: signature,
        });
        setRecoveredAddress(recoveredAddress);

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

  //const { data: signer } = useSigner();

  // useEffect(() => {
  //   const message = "3b973794ddCA0530D27f2737C989F63307253Ca2";
  //   const signature = signMessageAsync({ message: "Hello World!" });
  //   console.log(signature);
  // });

  const handleEnsChange = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setEns(event.target.value);
  };

  const handleUrlChange = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setUrl(event.target.value);
  };

  function createConfigAndProfile() {
    const dsEnsAndUrl = JSON.stringify({
      ens: ens,
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
    const config = { ...keys, ens: ens, rpc: url };
    const fileData = YAML.stringify(config);
    const blob = new Blob([fileData], { type: "text/plain" });
    const buttonUrl = URL.createObjectURL(blob);
    const buttonLink = document.createElement("a");
    buttonLink.download = "dm3-delivery-service-config_PRIVATE.yml";
    buttonLink.href = buttonUrl;
    buttonLink.click();
  }

  function publishProfile() {
    alert(`Will publish profile to the blockchain!`);
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
              <button onClick={createConfigAndProfile}>
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
          <button disabled={!profileAndKeysCreated} onClick={publishProfile}>
            Publish profile
          </button>
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

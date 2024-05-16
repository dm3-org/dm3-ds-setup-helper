import { ConnectButton, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { useEffect, useState } from "react";
import { recoverMessageAddress } from "viem";
import { useAccount, useSignMessage } from "wagmi";
// import { getAccount } from "wagmi/actions";
// import { useEffect } from "react";

const App = () => {
  const [ens, setEns] = useState("ens");
  const [url, setUrl] = useState("url");
  const [profile, setProfile] = useState("");
  const [signature, setSignature] = useState("");
  const [recoveredAddress, setRecoveredAddress] = useState("");
  const { isConnected, address } = useAccount();
  //const { status } = useSession();
  const {
    data: signMessageData,
    error,
    signMessage,
    variables,
  } = useSignMessage();

  useEffect(() => {
    (async () => {
      if (variables?.message && signMessageData) {
        const recoveredAddress = await recoverMessageAddress({
          message: variables?.message,
          signature: signMessageData,
        });
        setRecoveredAddress(recoveredAddress);
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
    // alert(`The config file creation is not implemented yet! Once it is, it will use these values:
    // ${ens} and ${url}`);
    const profile = JSON.stringify({
      ens: ens,
      url: url,
    });
    setProfile(profile);
    signMessage({
      message: "Hello World, my profile is " + profile,
    });
  }

  function publishProfile() {
    alert(`Will publish ${profile} to the blockchain!`);
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
            <h2>Step 1: config file and profile creation</h2>
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
                Create config file
              </button>
              <p>{recoveredAddress.length > 0 ? recoveredAddress : ""}</p>
            </div>
          </div>
          <div>
            <h2>Step 2: profile publication</h2>
            Now, please connect the account that controls the ENS domain so we
            can publish the profile.
            <p>
              Profile: {profile.length > 0 ? profile : "Finish step 1 first"}
            </p>
            <button onClick={publishProfile}>Publish profile</button>
            {/* <p>
            load profile from file (optional):
            <input type="file" />
          </p> */}
          </div>
        </div>
      </div>
    </RainbowKitProvider>
  );
};

export default App;

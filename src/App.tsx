import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState } from "react";

const App = () => {
  const [ens, setEns] = useState("ens");
  const [url, setUrl] = useState("url");
  const [profile, setProfile] = useState("profile");

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

  function clickMe() {
    // alert(`The config file creation is not implemented yet! Once it is, it will use these values:
    // ${ens} and ${url}`);
    setProfile(ens + url);
  }

  return (
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
        <p>
          <h1>Welcome</h1>
        </p>
        <p>
          <h2>Step 1: config file and profile creation</h2>
          To create the profile and config file, please connect the account the
          delivery service will use. Also, we need this information:
          <p>
            ENS:
            <input onChange={(event) => handleEnsChange(event)}></input>
          </p>
          <p>
            URL:
            <input onChange={(event) => handleUrlChange(event)}></input>
          </p>
          <div>
            <button onClick={clickMe}>Create config file</button>
          </div>
        </p>
        <p>
          <h2>Step 2: profile publication</h2>
          Now, please connect the account that controls the ENS domain so we can
          publish the profile.
          <p>Profile: {profile}</p>
          <p>
            URL:
            <input type="file" />
          </p>
        </p>
      </div>
    </div>
  );
};

export default App;

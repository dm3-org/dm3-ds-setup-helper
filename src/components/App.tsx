import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useConfiguration } from "../hooks/useConfiguration";
import { ConfigureProfile } from './ConfigureProfile';
import PublishProfile from './PublishProfile';
import { Docker } from "./Docker";
import { Info } from './Info';
import { Welcome } from "./Welcome";
import { Env } from "./Env";
import logo from "./../images/dm3-logo.png";


const App = () => {

  const { address, isConnected, handleEnsChange, handleRpcChange, handleUrlChange,
    createConfigAndProfile, profileAndKeysCreated, storeEnv, profile, writeContractIsPending,
    publishProfile, ensResolverFound, hash, writeContractError, ensError, rpcError, urlError,
    ensInput, rpc, url, userProfile, userProfileError, handleUserProfileChange,
    ensOwnershipError, userEns, userEnsError, handleUserEnsChange } = useConfiguration();

  return (
    <div className="ds-container">

      <div className="main-container">

        {/* DM3 logo */}
        <img className="dm3-logo" src={logo} alt="" />

        <h1 className="ds-title">
          DM3 Delivery Service Setup Helper
        </h1>

        {/* Rainbowkit connect button */}
        <div className="connect-btn">
          <ConnectButton />
        </div>

      </div>

      <div className="steps-container">

        <Welcome address={address} />

        <ConfigureProfile
          handleEnsChange={handleEnsChange}
          handleUrlChange={handleUrlChange}
          handleRpcChange={handleRpcChange}
          ens={ensInput}
          url={url}
          rpc={rpc}
          ensError={ensError}
          rpcError={rpcError}
          urlError={urlError}
          createConfigAndProfile={createConfigAndProfile}
          isConnected={isConnected}
          profile={profile}
        />

        <Env
          profileAndKeysCreated={profileAndKeysCreated}
          storeEnv={storeEnv}
        />

      </div>

      <PublishProfile
        ensResolverFound={ensResolverFound}
        hash={hash}
        userProfile={userProfile}
        profileAndKeysCreated={profileAndKeysCreated}
        publishProfile={publishProfile}
        writeContractError={writeContractError}
        writeContractIsPending={writeContractIsPending}
        handleUserProfileChange={handleUserProfileChange}
        userProfileError={userProfileError}
        ensOwnershipError={ensOwnershipError}
        userEns={userEns}
        userEnsError={userEnsError}
        handleUserEnsChange={handleUserEnsChange}
      />

      <Docker />

      <Info />

    </div>
  );
};

export default App;
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useConfiguration } from "../hooks/useConfiguration";
import { ConfigureProfile } from './ConfigureProfile';
import PublishProfile from './PublishProfile';
import { Docker } from "./Docker";
import { Info } from './Info';
import { Welcome } from "./Welcome";
import { Env } from "./Env";


const App = () => {

  const { address, isConnected, handleEnsChange, handleRpcChange, handleUrlChange, createConfigAndProfile,
    profileAndKeysCreated, storeEnv, profile, writeContractIsPending, publishProfile,
    ensResolverFound, hash, writeContractError } = useConfiguration();

  return (
    <div className="ds-container">
      <div className="main-container">
        <h1 className="ds-title">
          DM3 Delivery Service Setup Helper
        </h1>
        <div className="connect-btn">
          <ConnectButton />
        </div>
      </div>
      <div>
        <Welcome address={address} />
        <ConfigureProfile
          handleEnsChange={handleEnsChange}
          handleUrlChange={handleUrlChange}
          handleRpcChange={handleRpcChange}
          createConfigAndProfile={createConfigAndProfile}
          isConnected={isConnected}
        />
        <Env
          profileAndKeysCreated={profileAndKeysCreated}
          storeEnv={storeEnv}
        />
      </div>
      <PublishProfile
        ensResolverFound={ensResolverFound}
        hash={hash}
        profile={profile}
        profileAndKeysCreated={profileAndKeysCreated}
        publishProfile={publishProfile}
        writeContractError={writeContractError}
        writeContractIsPending={writeContractIsPending}
      />
      <Docker />
      <Info />
    </div>
  );
};

export default App;
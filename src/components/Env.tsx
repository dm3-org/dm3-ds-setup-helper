import { storeConfig } from "../utils/fileUtils";

interface EnvProps {
    profileAndKeysCreated: boolean,
    storeEnv: () => void,
}

export function Env(props: EnvProps) {
    return <div className="step description-text">

        <h2 className="heading-text">Step 2: Store dm3-ds.env and config.yml</h2>

        <p>
            Please download both dm3-ds.env file & config.yml file by clicking below buttons and keep it securely with you.
            Both the files are needed in step 4.
        </p>

        {/* Button to download .env file */}
        <button
            className={"btn env-btn active-btn ".concat((!props.profileAndKeysCreated ? "disabled-btn" : ""))}
            disabled={!props.profileAndKeysCreated}
            onClick={props.storeEnv}>
            Store .env
        </button>{" "}

        {/* Button to download .config.yml file */}
        <button
            className={"btn env-btn active-btn ".concat((!props.profileAndKeysCreated ? "disabled-btn" : ""))}
            disabled={!props.profileAndKeysCreated}
            onClick={storeConfig}>
            Store default config
        </button>
    </div>
}
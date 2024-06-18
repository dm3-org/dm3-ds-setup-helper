interface EnvProps {
    profileAndKeysCreated: boolean,
    storeEnv: () => void,
    storeConfig: () => void,
}

export function Env(props: EnvProps) {
    return <div>
        <h2>Step 2: store .env and config.yml</h2>
        <button disabled={!props.profileAndKeysCreated} onClick={props.storeEnv}>
            Store .env
        </button>{" "}
        <button onClick={props.storeConfig}>Store default config</button>
    </div>
}
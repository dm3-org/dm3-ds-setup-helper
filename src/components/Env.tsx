import { useState } from 'react';
import { storeConfig } from '../utils/fileUtils';

interface EnvProps {
    rpc: string;
    profileAndKeysCreated: boolean;
    storeEnv: () => void;
}

export function Env(props: EnvProps) {
    const [showRpcInfo, setShowRpcInfo] = useState<boolean>(false);

    return (
        <div className="step description-text">
            <h2 className="heading-text">
                Step 2: Store dm3-ds.env and config.yml
            </h2>
            <p>
                Please download both dm3-ds.env file & config.yml file by
                clicking below buttons and keep it securely with you. Both the
                files are needed in step 4.
            </p>
            {showRpcInfo &&
                props.profileAndKeysCreated &&
                !props.rpc.length && (
                    <p className="info-text">
                        Remember to add a valid rpc url to your .env file before
                        using it.
                    </p>
                )}
            {/* Button to download .env file */}
            <button
                className={'btn env-btn active-btn '.concat(
                    !props.profileAndKeysCreated ? 'disabled-btn' : '',
                )}
                disabled={!props.profileAndKeysCreated}
                onClick={() => {
                    setShowRpcInfo(true);
                    props.storeEnv();
                }}
            >
                Store .env
            </button>{' '}
            {/* Button to download .config.yml file */}
            <button
                className={'btn env-btn active-btn '.concat(
                    !props.profileAndKeysCreated ? 'disabled-btn' : '',
                )}
                disabled={!props.profileAndKeysCreated}
                onClick={storeConfig}
            >
                Store default config
            </button>
        </div>
    );
}

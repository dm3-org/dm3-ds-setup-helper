import { DeliveryServiceProfile } from '@dm3-org/dm3-lib-profile';
import { useEffect, useState } from 'react';

interface ConfigureProfileProps {
    ens: string;
    rpc: string;
    url: string;
    handleEnsChange: (
        event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
    ) => void;
    handleUrlChange: (
        event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
    ) => void;
    handleRpcChange: (
        event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
    ) => void;
    createConfigAndProfile: () => void;
    ensError: string | null;
    rpcError: string | null;
    urlError: string | null;
    isConnected: boolean;
    profile: DeliveryServiceProfile | undefined;
}

export function ConfigureProfile(props: ConfigureProfileProps) {
    const [showSuccessMsg, setShowSuccessMsg] = useState<boolean>(false);

    const isDisabled =
        !props.isConnected || !props.ens.length || !props.url.length
            ? true
            : false;

    // show success message of profile creation for 3 seconds & then clears the msg from UI
    useEffect(() => {
        if (props.profile) {
            setShowSuccessMsg(true);
            setTimeout(() => {
                setShowSuccessMsg(false);
            }, 3000);
        }
    }, [props.profile]);

    return (
        <div className="description-text step">
            <h2 className="heading-text">Step 1: Create config and profile</h2>
            To create the profile and config file, please connect the account
            the delivery service will use. Also, we need this information:
            <div className="base-input-container">
                {/* Error msg of ENS name */}
                <div className="input-description">
                    <span className="input-heading-hidden">ENS:</span>
                    {props.ensError && (
                        <span className="error">{props.ensError}</span>
                    )}
                </div>
                {/* Input field to enter ENS name */}
                <div className="input-container">
                    <span className="input-heading">ENS:</span>
                    <input
                        className="input-field"
                        value={props.ens}
                        onChange={(event) => props.handleEnsChange(event)}
                    />
                </div>
                {/* Description content for ENS name */}
                <div className="input-description">
                    <span className="input-heading-hidden">ENS:</span>
                    The ens domain your delivery service will use, e.g.
                    myPersonalDeliveryService.eth
                </div>
            </div>
            <div className="base-input-container">
                {/* Error msg of URL endpoint */}
                <div className="input-description">
                    <span className="input-heading-hidden">URL:</span>
                    {props.urlError && (
                        <span className="error">{props.urlError}</span>
                    )}
                </div>
                {/* Input field to enter URL name */}
                <div className="input-container">
                    <span className="input-heading">URL:</span>
                    <input
                        className="input-field"
                        value={props.url}
                        onChange={(event) => props.handleUrlChange(event)}
                    />
                </div>
                {/* Description content for URL name */}
                <div className="input-description">
                    <span className="input-heading-hidden">URL:</span>
                    The url your delivery service will use, e.g.
                    https://my-personal-delivery-service.com
                </div>
            </div>
            <div className="base-input-container">
                {/* Error msg of RPC endpoint */}
                <div className="input-description">
                    <span className="input-heading-hidden">RPC:</span>
                    {props.rpcError && (
                        <span className="error">{props.rpcError}</span>
                    )}
                </div>
                {/* Input field to enter RPC name */}
                <div className="input-container">
                    <span className="input-heading">RPC:</span>
                    <input
                        className="input-field"
                        value={props.rpc}
                        onChange={(event) => props.handleRpcChange(event)}
                    />
                </div>
                {/* Description content for RPC name */}
                <div className="input-description">
                    <span className="input-heading-hidden">RPC:</span>
                    The rpc url your delivery service will use, e.g.
                    https://mainnet.infura.io/v3/f02ijf0283i0jq0jdoisjd07829 RPC
                    can be added later also to the dm3-ds.env file.
                </div>
            </div>
            <div className="input-description">
                <span className="input-heading-hidden">RPC:</span>

                {/* Success msg of profile creation */}
                {showSuccessMsg && (
                    <span className="success">
                        Profile created successfully!
                    </span>
                )}
            </div>
            {/* Button to sign the profile */}
            <div>
                <button
                    className={'btn env-btn active-btn '.concat(
                        isDisabled ? 'disabled-btn' : '',
                    )}
                    disabled={isDisabled}
                    onClick={() => props.createConfigAndProfile()}
                >
                    Create profile and .env
                </button>
            </div>
        </div>
    );
}

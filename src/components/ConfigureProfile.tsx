import { DeliveryServiceProfile } from "@dm3-org/dm3-lib-profile";
import { useEffect, useState } from "react";

interface ConfigureProfileProps {
    ens: string,
    rpc: string,
    url: string,
    handleEnsChange: (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void,
    handleUrlChange: (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void,
    handleRpcChange: (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void,
    createConfigAndProfile: () => void,
    ensError: string | null,
    rpcError: string | null,
    urlError: string | null,
    isConnected: boolean,
    profile: DeliveryServiceProfile | undefined
}

export function ConfigureProfile(props: ConfigureProfileProps) {

    const [showSuccessMsg, setShowSuccessMsg] = useState<boolean>(false);

    const isDisabled = (!props.isConnected || !props.ens.length || !props.url.length || !props.rpc.length)
        ? true : false;

    // show success message of profile creation for 3 seconds & then clears the msg from UI
    useEffect(() => {
        if (props.profile) {
            setShowSuccessMsg(true);
            setTimeout(() => {
                setShowSuccessMsg(false);
            }, 3000);
        }
    }, [props.profile])

    return <div className="description-text step">

        <h2 className="heading-text">Step 1: Create config and profile</h2>
        To create the profile and config file, please connect the account
        the delivery service will use. Also, we need this information:

        {/* Input field to enter ENS name */}
        <p className="config-profile-para">
            <span className="input-heading">ENS:</span>
            <input
                className="input-field"
                value={props.ens}
                onChange={(event) => props.handleEnsChange(event)} />
            <b className="mandatory">*</b>
            (the ens domain your delivery service will use, e.g.
            myPersonalDeliveryService.eth)
        </p>

        {/* Error msg of ENS name */}
        {props.ensError && <span className="error">{props.ensError}</span>}

        {/* Input field to enter URL endpoint */}
        <p className="config-profile-para">
            <span className="input-heading">URL:</span>
            <input
                className="input-field"
                value={props.url}
                onChange={(event) => props.handleUrlChange(event)} />
            <b className="mandatory">*</b>
            (the url your delivery service will use, e.g.
            https://my-personal-delivery-service.com)
        </p>

        {/* Error msg of URL endpoint */}
        {props.urlError && <span className="error">{props.urlError}</span>}

        {/* Input field to enter RPC node url */}
        <p className="config-profile-para">
            <span className="input-heading">RPC:</span>
            <input
                className="input-field"
                value={props.rpc}
                onChange={(event) => props.handleRpcChange(event)} />
            <b className="mandatory">*</b>
            (the rpc url your delivery service will use, e.g.
            https://mainnet.infura.io/v3/f02ijf0283i0jq0jdoisjd07829)
        </p>

        {/* Error msg of RPC node endpoint */}
        {props.rpcError && <span className="error">{props.rpcError}</span>}

        {/* Success msg of profile creation */}
        {showSuccessMsg && <span className="success">Profile created successfully!</span>}

        {/* Button to sign the profile */}
        <div>
            <button
                className={"btn env-btn active-btn ".concat((isDisabled ? "disabled-btn" : ""))}
                disabled={isDisabled}
                onClick={() => props.createConfigAndProfile()}>
                Create profile and .env
            </button>
        </div>
    </div>
}
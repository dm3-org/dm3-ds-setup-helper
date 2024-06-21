interface ConfigureProfileProps {
    handleEnsChange: (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void,
    handleUrlChange: (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void,
    handleRpcChange: (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void,
    createConfigAndProfile: () => void,
    ensError: string | null,
    rpcError: string | null,
    urlError: string | null,
    isConnected: boolean,
}

export function ConfigureProfile(props: ConfigureProfileProps) {

    return <div>
        <h2>Step 1: Create config and profile</h2>
        To create the profile and config file, please connect the account
        the delivery service will use. Also, we need this information:
        <p className="config-profile-para">
            ENS:
            <input onChange={(event) => props.handleEnsChange(event)}></input>
            <b className="mandatory">*</b>
            (the ens domain your delivery service will use, e.g.
            myPersonalDeliveryService.eth)
        </p>
        {props.ensError && <span className="error">{props.ensError}</span>}
        <p className="config-profile-para">
            URL:
            <input onChange={(event) => props.handleUrlChange(event)}></input>
            <b className="mandatory">*</b>
            (the url your delivery service will use, e.g.
            https://my-personal-delivery-service.com)
        </p>
        {props.urlError && <span className="error">{props.urlError}</span>}
        <p className="config-profile-para">
            RPC:
            <input onChange={(event) => props.handleRpcChange(event)}></input>
            <b className="mandatory">*</b>
            (the rpc url your delivery service will use, e.g.
            https://mainnet.infura.io/v3/f02ijf0283i0jq0jdoisjd07829)
        </p>
        {props.rpcError && <span className="error">{props.rpcError}</span>}
        <div>
            <button className="env-btn" disabled={!props.isConnected} onClick={() => props.createConfigAndProfile()}>
                Create profile and .env
            </button>
        </div>
    </div>
}
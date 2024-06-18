interface ConfigureProfileProps {
    handleEnsChange: (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void,
    handleUrlChange: (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void,
    handleRpcChange: (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void,
    createConfigAndProfile: () => void,
    isConnected: boolean,
}

export function ConfigureProfile(props: ConfigureProfileProps) {

    return <div>
        <h2>Step 1: create config and profile</h2>
        To create the profile and config file, please connect the account
        the delivery service will use. Also, we need this information:
        <p>
            ENS:
            <input onChange={(event) => props.handleEnsChange(event)}></input>
            (the ens domain your delivery service will use, e.g.
            myPersonalDeliveryService.eth)
        </p>
        <p>
            URL:
            <input onChange={(event) => props.handleUrlChange(event)}></input>
            (the url your delivery service will use, e.g.
            https://my-personal-delivery-service.com)
        </p>
        <p>
            RPC:
            <input onChange={(event) => props.handleRpcChange(event)}></input>
            (the rpc url your delivery service will use, e.g.
            https://mainnet.infura.io/v3/f02ijf0283i0jq0jdoisjd07829)
        </p>
        <div>
            <button disabled={!props.isConnected} onClick={props.createConfigAndProfile}>
                Create profile and .env
            </button>
        </div>
    </div>
}
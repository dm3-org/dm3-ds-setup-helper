import { DeliveryServiceProfile } from "@dm3-org/dm3-lib-profile";

interface PublishProfileProps {
    profileAndKeysCreated: boolean,
    profile: DeliveryServiceProfile | undefined,
    writeContractIsPending: boolean,
    ensResolverFound: boolean,
    publishProfile: () => void,
    hash: `0x${string}` | undefined,
    writeContractError: any
}

export default function PublishProfile(props: PublishProfileProps) {
    return <div className="steps-container description-text step">

        <h2 className="heading-text">Step 3: Publish profile</h2>

        Now, please connect the account that controls the ENS domain so we can
        publish the profile.

        {/* User profile created */}
        <p className="profile">
            {props.profileAndKeysCreated && "Profile: " + JSON.stringify(props.profile)}
        </p>

        {/* Transaction status */}
        <p>
            Write contract state: {props.writeContractIsPending ? "pending" : "done"}
        </p>

        {/* Transaction hash */}
        {props.hash && <p className="success">{props.hash}</p>}

        {/* Transaction error */}
        {props.writeContractError && <p className="error">{props.writeContractError.details
            ? props.writeContractError.details : JSON.stringify(props.writeContractError)}</p>}

        {/* Button to publish profile & send transaction */}
        <button
            className={"btn env-btn active-btn ".concat(
                ((!props.profileAndKeysCreated || !props.ensResolverFound) ? "disabled-btn" : "")
            )}
            disabled={!props.profileAndKeysCreated || !props.ensResolverFound}
            onClick={props.publishProfile}
        >
            Publish profile
        </button>
    </div>
}
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
    return <div>
        <h2>Step 3: publish profile</h2>
        Now, please connect the account that controls the ENS domain so we can
        publish the profile.
        <p>
            {props.profileAndKeysCreated && "Profile: " + JSON.stringify(props.profile)}
        </p>
        <p>
            Write contract state: {props.writeContractIsPending ? "pending" : "done"}
        </p>
        <button
            disabled={!props.profileAndKeysCreated || !props.ensResolverFound}
            onClick={props.publishProfile}
        >
            Publish profile
        </button>
        <p>{props.hash && props.hash}</p>
        <p>{props.writeContractError && JSON.stringify(props.writeContractError)}</p>
    </div>
}
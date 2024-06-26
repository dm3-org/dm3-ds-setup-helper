interface PublishProfileProps {
    profileAndKeysCreated: boolean,
    userProfile: string,
    writeContractIsPending: boolean,
    ensResolverFound: boolean,
    publishProfile: () => void,
    hash: `0x${string}` | undefined,
    writeContractError: any,
    userProfileError: string | null,
    ensOwnershipError: string | null,
    handleUserProfileChange: (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void,
    userEns: string,
    userEnsError: string | null,
    handleUserEnsChange: (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void,
}

export default function PublishProfile(props: PublishProfileProps) {

    return <div className="steps-container description-text step">

        <h2 className="heading-text">Step 3: Publish profile</h2>

        Now, please connect the account that controls the ENS domain so we can
        publish the profile.

        <div className="base-input-container">

            <div className="input-description profile-msg-container">
                <span className="input-heading-hidden">ENS:</span>

                {/* Error msg for ENS */}
                {props.userEnsError && <span className="error">{props.userEnsError}</span>}

                {/* Error msg for ens name ownership */}
                {props.ensOwnershipError && <span className="error">{props.ensOwnershipError}</span>}

            </div>

            {/* Input field to enter user ENS */}
            <div className="input-container">
                <span className="input-heading">ENS:</span>
                <input
                    className="input-field"
                    value={props.userEns}
                    onChange={(event) => props.handleUserEnsChange(event)} />
            </div>

            {/* Description content for ENS */}
            <div className="input-description">
                <span className="input-heading-hidden">Profile:</span>
                Please don't modify the ENS name if it is auto populated. If it is not auto
                populated, please copy the value of ENS_DOMAIN from dm3-ds.env file and paste it in the input field
            </div>

            <div className="input-description profile-msg-container">
                <span className="input-heading-hidden">Profile:</span>

                {/* Error msg for profile */}
                {props.userProfileError && <span className="error">{props.userProfileError}</span>}

                {/* Transaction error */}
                {props.writeContractError && <span className="error">{props.writeContractError.details
                    ? props.writeContractError.details : JSON.stringify(props.writeContractError)}</span>
                }
            </div>

            {/* Input field to enter Profile name */}
            <div className="input-container">
                <span className="input-heading">Profile:</span>
                <input
                    className="input-field"
                    value={props.userProfile}
                    onChange={(event) => props.handleUserProfileChange(event)} />
            </div>

            {/* Description content for Profile name */}
            <div className="input-description">
                <span className="input-heading-hidden">Profile:</span>
                Please don't modify the profile data if it is auto populated. If it is not auto
                populated, please copy the value of PROFILE as JSON object from dm3-ds.env file and paste it
                in the input field
            </div>

        </div>

        <div className="input-description">
            <span className="input-heading-hidden">Profile:</span>

            {/* Transaction status */}
            <span>
                Write contract state: {props.writeContractIsPending ? "pending" : "done"}
            </span>
        </div>

        <div className="input-description">
            <span className="input-heading-hidden">Profile:</span>

            {/* Profile published message */}
            {props.hash && <span className="success">Profile published successfully!</span>}
        </div>

        {/* Button to publish profile & send transaction */}
        <button
            className={"btn env-btn active-btn ".concat(
                ((!props.userProfile || !props.userEns) ? "disabled-btn" : "")
            )}
            disabled={!props.userProfile || !props.userEns}
            onClick={props.publishProfile}
        >
            Publish profile
        </button>
    </div>
}
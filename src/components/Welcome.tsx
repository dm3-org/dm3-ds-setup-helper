interface WelcomeProps {
    address: `0x${string}` | undefined
}

export function Welcome(props: WelcomeProps) {
    return <>
        <h2>Welcome {props.address}</h2>
        <div>
            This web app will help you to set up a dm3 delivery service. You can
            do steps 1 and 2 (generating and saving your keys) offline. The last
            steps need an internet connection, as they execute a transaction on
            the ethereum blockchain and download stuff.{" "}
        </div>
    </>
}
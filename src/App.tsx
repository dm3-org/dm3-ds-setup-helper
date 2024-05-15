import { ConnectButton } from "@rainbow-me/rainbowkit";

const App = () => {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          padding: 12,
        }}
      >
        <ConnectButton />
      </div>
      <div>Welcome</div>
    </div>
  );
};

export default App;

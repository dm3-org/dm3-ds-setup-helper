export const resolverAbi = [
  {
    name: "setText",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { internalType: "bytes32", name: "node", type: "bytes32" },
      { internalType: "string calldata", name: "key", type: "string calldata" },
      {
        internalType: "string calldata",
        name: "value",
        type: "string calldata",
      },
    ],
    outputs: [],
  },
] as const;

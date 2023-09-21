import { Chain, Hex, isAddress } from "viem";
import {
  arbitrum,
  mainnet,
  polygon,
  gnosis,
  goerli,
  optimism,
} from "wagmi/chains";

import { ValidNetwork, isValidNetwork } from "@daohaus/keychain-utils";
import { loaders } from "@shazow/whatsabi";

const { EtherscanABILoader, SourcifyABILoader, MultiABILoader } = loaders;

export type Args = {
  chain: Chain;
  chainId: ValidNetwork;
  baal: Hex;
  proposalId: number;
  loader: loaders.ABILoader;
};

export const parseArgs = (args: string[]): Args => {
  const parsedArgs = args.slice(2).reduce((acc, curr) => {
    const [key, value] = curr.split("=");
    const trimmedKey = key.replace("--", "");
    return {
      ...acc,
      [trimmedKey]: value,
    };
  }, {});

  try {
    const validatedArgs = validateArgs(parsedArgs);
    return validatedArgs;
  } catch (e) {
    const wrappedError = new Error(
      `Error parsing args: ${
        (e as Error).message
      }\nUsage: yarn decode --network=<network> --baal=<address> --proposal=<number>\nSupported networks: ${SUPPORTED_NETWORKS.join(
        ", ",
      )}`,
    );
    throw wrappedError;
  }
};

const SUPPORTED_NETWORKS = [
  "arbitrum",
  "mainnet",
  "polygon",
  "gnosis",
  "goerli",
  "optimism",
];

const NETWORK_TO_CHAIN: Record<string, Chain> = {
  mainnet: mainnet,
  goerli: goerli,
  gnosis: gnosis,
  polygon: polygon,
  optimism: optimism,
  arbitrum: arbitrum,
};

const NETWORK_TO_CHAIN_ID: Record<string, Hex> = {
  mainnet: "0x1",
  goerli: "0x5",
  gnosis: "0x64",
  polygon: "0x89",
  optimism: "0xa",
  arbitrum: "0xa4b1",
};

const ETHERSCAN_API_URL: Record<string, string> = {
  // '0x1': `https://api.etherscan.io/api?module=contract&action=getabi&address=${ABI_ADDRESS}&apikey=${explorerKeys[chainId]}`,
  // '0x5': `https://api-goerli.etherscan.io/api?module=contract&action=getabi&address=${ABI_ADDRESS}&apikey=${explorerKeys[chainId]}`,
  // '0x64': `https://api.gnosisscan.io/api?module=contract&action=getabi&address=${ABI_ADDRESS}&apikey=${explorerKeys[chainId]}`,
  // '0x89': `https://api.polygonscan.com/api?module=contract&action=getabi&address=${ABI_ADDRESS}&apikey=${explorerKeys[chainId]}`,
  // '0xa': `https://api-optimistic.etherscan.io/api?module=contract&action=getabi&address=${ABI_ADDRESS}&apikey=${explorerKeys[chainId]}`,
  // '0xa4b1': `https://api.arbiscan.io/api?module=contract&action=getabi&address=${ABI_ADDRESS}&apiKey=${explorerKeys[chainId]}`,
  mainnet: `https://api.etherscan.io/api`,
  goerli: `https://api-goerli.etherscan.io/api`,
  gnosis: `https://api.gnosisscan.io/api`,
  polygon: `https://api.polygonscan.com/api`,
  optimism: `https://api-optimistic.etherscan.io/api`,
  arbitrum: `https://api.arbiscan.io/api`,
};

const validateArgs = (args: Record<string, string>): Args => {
  if (!args.network) {
    throw new Error("Missing network argument");
  }
  if (!args.baal) {
    throw new Error("Missing baal argument");
  }
  if (!args.proposal) {
    throw new Error("Missing proposal argument");
  }

  if (!SUPPORTED_NETWORKS.includes(args.network)) {
    throw new Error(`Invalid network ${args.network}`);
  }

  if (!isAddress(args.baal)) {
    throw new Error(
      `Invalid baal address ${args.baal}, must be a valid address`,
    );
  }

  const num = Number(args.proposal);

  if (isNaN(num)) {
    throw new Error(`Invalid proposal ${args.proposal}, must be a number`);
  }

  if (num < 0) {
    throw new Error(
      `Invalid proposal ${args.proposal}, must be a positive number`,
    );
  }

  if (!Number.isInteger(num)) {
    throw new Error(`Invalid proposal ${args.proposal}, must be an integer`);
  }

  const chain = NETWORK_TO_CHAIN[args.network];
  if (!chain) {
    throw new Error(`Invalid network ${args.network}`);
  }

  const chainId = NETWORK_TO_CHAIN_ID[args.network];
  if (!chainId || !isValidNetwork(chainId)) {
    throw new Error(`Invalid network ${args.network}`);
  }

  const config = {
    apiKey: process.env.ETHERSCAN_API_KEY,
    baseURL: ETHERSCAN_API_URL[args.network],
  };

  const loader = new MultiABILoader([
    new SourcifyABILoader(),
    new EtherscanABILoader(config),
  ]);

  return {
    chain,
    chainId: chainId as ValidNetwork,
    baal: args.baal,
    proposalId: num,
    loader,
  };
};

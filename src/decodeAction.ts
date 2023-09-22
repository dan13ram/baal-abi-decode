import { ethers } from "ethers";
import {
  decodeFunctionDataWithInputs,
  decodeMultiWithOperation,
} from "./helpers";
import { Args } from "./parseArgs";
import { whatsabi } from "@shazow/whatsabi";

export const decodeAction = async (
  args: Args,
  to: `0x${string}`,
  data: `0x${string}`
): Promise<Record<string, any>> => {
  if (!data || data === "0x" || !data.startsWith("0x")) {
    return {};
  }

  const { abi } = await whatsabi.autoload(to, {
    provider: new ethers.JsonRpcProvider(args.chain.rpcUrls.default.http[0]),
    followProxies: true,
    abiLoader: args.loader,
  });

  const result = decodeFunctionDataWithInputs({
    abi,
    data,
  });

  if (result.functionName === "multiSend" && result.inputs.length === 1) {
    const decodedActions = await decodeMultiCall(args, data);

    return {
      ...result,
      decodedData: decodedActions,
    };
  }

  if (result.functionName.toLowerCase().includes("exec")) {
    const inputTo = result.inputs.find((input) => input.type === "address");
    const inputData = result.inputs.find((input) => input.type === "bytes");

    if (!inputTo || !inputData) {
      return {
        ...result,
        decodedData: {},
      };
    }

    const decodedData = await decodeAction(
      args,
      inputTo.value as `0x${string}`,
      inputData.value as `0x${string}`
    );

    return {
      ...result,
      decodedData,
    };
  }

  return result;
};

export const decodeMultiCall = async (
  args: Args,
  data: string
): Promise<any[]> => {
  const proposalActions = decodeMultiWithOperation(data);

  const decodedProposalActions = await Promise.all(
    proposalActions.map(async (action) => {
      return {
        ...action,
        decodedData: await decodeAction(
          args,
          action.to as `0x${string}`,
          action.data as `0x${string}`
        ),
      };
    })
  );

  return decodedProposalActions;
};

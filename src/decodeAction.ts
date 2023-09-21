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
  data: `0x${string}`,
): Promise<any> => {
  const provider = new ethers.JsonRpcProvider(args.rpcUrl);
  const { abi } = await whatsabi.autoload(to, {
    provider,
    followProxies: true,
    abiLoader: args.loader,
  });

  if (!data || data === "0x" || !data.startsWith("0x")) {
    return {
      functionName: "unknown",
      to: to,
      data: data,
    };
  }

  const result = decodeFunctionDataWithInputs({
    abi,
    data,
  });

  if (
    result.functionName === "multiSend" &&
    result.inputs.length === 1 &&
    result.inputs[0].name === "transactions"
  ) {
    const decodedActions = await decodeMultiCall(args, data);

    return {
      ...result,
      decodedData: decodedActions,
    };
  }

  if (result.functionName.toLowerCase().includes("exec")) {
    const inputTo = result.inputs.find(
      (input) => input.name === "to" || input.name === "_to",
    );
    const inputData = result.inputs.find(
      (input) => input.name === "data" || input.name === "_data",
    );
    const inputValue = result.inputs.find(
      (input) => input.name === "value" || input.name === "_value",
    );

    if (!inputTo || !inputData || !inputValue) {
      return result;
    }

    const decodedData = await decodeAction(
      args,
      inputTo.value as `0x${string}`,
      inputData.value as `0x${string}`,
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
  data: string,
): Promise<any[]> => {
  const proposalActions = decodeMultiWithOperation(data);

  const decodedProposalActions = await Promise.all(
    proposalActions.map(async (action) => {
      return {
        ...action,
        decodedData: await decodeAction(
          args,
          action.to as `0x${string}`,
          action.data as `0x${string}`,
        ),
      };
    }),
  );

  return decodedProposalActions;
};

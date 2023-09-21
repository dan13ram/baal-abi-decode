import { MetaTransaction } from "ethers-multisend";
import { decodeFunctionData, getAbiItem } from "viem";

// @ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString();
};

export const logMultiSendActions = (actions: MetaTransaction[]) => {
  const actionsWithOperation = actions.map((a) => ({
    ...a,
    operation: a.operation === 0 ? "call" : "delegatecall",
  }));

  console.log(JSON.stringify(actionsWithOperation, null, 2));
};

type FunctionDataWithInputs = Parameters<typeof decodeFunctionData>[0];

type FunctionDataWithInputsReturnType = ReturnType<
  typeof decodeFunctionData
> & {
  inputs: ReturnType<typeof getAbiItem>["inputs"];
};

export const decodeFunctionDataWithInputs = (
  options: FunctionDataWithInputs
): FunctionDataWithInputsReturnType => {
  const result = decodeFunctionData(options);

  const functionDetails = getAbiItem({
    abi: options.abi,
    name: result.functionName,
  });

  return {
    functionName: result.functionName,
    inputs: functionDetails["inputs"],
    args: result.args,
  } as FunctionDataWithInputsReturnType;
};

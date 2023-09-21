import { MetaTransaction, decodeMulti } from "ethers-multisend";
import { decodeFunctionData, getAbiItem } from "viem";

// @ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString();
};

export type MetaTx = MetaTransaction & {
  operationType: "call" | "delegatecall";
};

export const decodeMultiWithOperation = (data: string): MetaTx[] => {
  const actions = decodeMulti(data);
  const actionsWithOperation = actions.map((a) => ({
    ...a,
    operationType: a.operation === 0 ? "call" : "delegatecall",
  }));

  return actionsWithOperation as MetaTx[];
};

export const prettyPrint = (obj: any) =>
  console.log(JSON.stringify(obj, null, 2));

type FunctionDataWithInputs = Parameters<typeof decodeFunctionData>[0];

type FunctionDataWithInputsReturnType = {
  functionName: string;
  inputs: {
    name: string;
    type: string;
    value: any;
  }[];
};

export const decodeFunctionDataWithInputs = (
  options: FunctionDataWithInputs
): FunctionDataWithInputsReturnType => {
  const result = decodeFunctionData(options);

  const functionDetails = getAbiItem({
    abi: options.abi,
    name: result.functionName,
  });

  const inputs = functionDetails["inputs"] || [];

  const inputsWithValues = (inputs as any[]).map((input, index) => ({
    name: input.name,
    type: input.type,
    value: result.args?.[index],
  }));

  return {
    functionName: result.functionName,
    inputs: inputsWithValues,
  };
};

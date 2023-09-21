import { MolochV3Dao, findDao } from "@daohaus/moloch-v3-data";
import { Args } from "./parseArgs";

const graphApiKeys = {
  "0x1": process.env.GRAPH_API_KEY,
  "0x64": process.env.GRAPH_API_KEY,
};

export const fetchDaoData = async (args: Args): Promise<MolochV3Dao> => {
  const { baal, chainId } = args;
  const daoResult = await findDao({
    networkId: chainId,
    dao: baal,
    graphApiKeys,
  });

  const dao = daoResult.data?.dao;

  if (!dao) {
    throw new Error(`No dao found for ${baal} on ${chainId}`);
  }

  return dao;
};

import { MolochV3Proposal, findProposal } from "@daohaus/moloch-v3-data";
import { Args } from "./parseArgs";

const graphApiKeys = {
  "0x1": process.env.GRAPH_API_KEY,
  "0x64": process.env.GRAPH_API_KEY,
};

export const fetchProposalData = async (
  args: Args,
): Promise<MolochV3Proposal> => {
  const { proposalId, baal, chainId } = args;
  const proposalResult = await findProposal({
    networkId: chainId,
    proposalId: proposalId.toString(),
    dao: baal,
    graphApiKeys,
  });

  const proposal = proposalResult.data?.proposal;

  if (!proposal) {
    throw new Error(
      `No proposal found for ${baal} on ${chainId} with id ${proposalId}`,
    );
  }

  return proposal;
};

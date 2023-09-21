import { decodeMultiCall } from "./decodeAction";
import { prettyPrint } from "./helpers";
import { parseArgs } from "./parseArgs";
import { fetchProposalData } from "./proposalData";

const main = async () => {
  const args = parseArgs(process.argv);

  console.log("Chain:", `${args.chain.name} (${args.chainId})`);
  console.log("Baal:", args.baal);
  console.log("Proposal ID:", args.proposalId);
  console.log("\n");

  const proposal = await fetchProposalData(args);
  console.log("Proposal Title:", proposal.title);
  console.log("Proposal Description:", proposal.description);
  console.log("Proposal Type:", proposal.proposalType);
  console.log("Proposal State:", proposal.status);
  console.log("Proposal By:", proposal.proposedBy);
  console.log("Proposal Data:", proposal.proposalData);
  console.log("\n");

  if (proposal.proposalType !== "MULTICALL") {
    throw new Error("Proposal type is not MULTICALL");
  }

  if (!proposal.proposalData || proposal.proposalData === "0x") {
    throw new Error("Proposal data is empty");
  }

  const proposalActions = await decodeMultiCall(args, proposal.proposalData);
  console.log("Decoded Proposal Actions:");
  prettyPrint(proposalActions);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

import {
  createStoredGovernanceProposal,
  createStoredGovernanceVote,
  getStoredGovernanceProposal,
  hasStoredGovernanceVote,
  listStoredGovernanceProposals,
  updateStoredGovernanceProposal,
  type StoredGovernanceProposal,
} from "../storage/repositories.js";

export type GovernanceVoteChoice = "FOR" | "AGAINST";
export type GovernanceProposalStatus = "ACTIVE" | "CLOSED";
export type GovernanceProposal = StoredGovernanceProposal;

const PROPOSAL_DURATION_DAYS = 7;

async function getProposalStatus(proposal: GovernanceProposal): Promise<GovernanceProposalStatus> {
  if (proposal.status === "CLOSED") {
    return "CLOSED";
  }

  if (Date.now() >= new Date(proposal.expiresAt).getTime()) {
    proposal.status = "CLOSED";
    await updateStoredGovernanceProposal(proposal);
    return "CLOSED";
  }

  return "ACTIVE";
}

export async function listGovernanceProposals() {
  const proposals = await listStoredGovernanceProposals();

  const resolvedProposals = await Promise.all(
    proposals.map(async (proposal) => ({
      ...proposal,
      status: await getProposalStatus(proposal),
    }))
  );

  return resolvedProposals.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createGovernanceProposal(params: {
  title: string;
  description: string;
  creatorWallet: string;
}) {
  const id = crypto.randomUUID();
  const createdAt = new Date();
  const expiresAt = new Date(createdAt);
  expiresAt.setDate(expiresAt.getDate() + PROPOSAL_DURATION_DAYS);

  const proposal: GovernanceProposal = {
    id,
    title: params.title,
    description: params.description,
    creatorWallet: params.creatorWallet,
    status: "ACTIVE",
    votesFor: 0,
    votesAgainst: 0,
    createdAt: createdAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  return createStoredGovernanceProposal(proposal);
}

export async function voteGovernanceProposal(params: {
  proposalId: string;
  walletAddress: string;
  choice: GovernanceVoteChoice;
  weight: number;
}) {
  const proposal = await getStoredGovernanceProposal(params.proposalId);

  if (!proposal) {
    return null;
  }

  if ((await getProposalStatus(proposal)) !== "ACTIVE") {
    throw new Error("GOVERNANCE_PROPOSAL_CLOSED");
  }

  if (await hasStoredGovernanceVote(params.proposalId, params.walletAddress)) {
    throw new Error("WALLET_ALREADY_VOTED");
  }

  await createStoredGovernanceVote({
    proposalId: params.proposalId,
    walletAddress: params.walletAddress,
    choice: params.choice,
    weight: params.weight,
  });

  if (params.choice === "FOR") {
    proposal.votesFor += params.weight;
  } else {
    proposal.votesAgainst += params.weight;
  }

  return updateStoredGovernanceProposal(proposal);
}

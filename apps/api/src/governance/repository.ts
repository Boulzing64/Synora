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
export type GovernanceProposal = StoredGovernanceProposal & {
  quorum: number;
  quorumReached: boolean;
  totalVotes: number;
  remainingSeconds: number;
};

const PROPOSAL_DURATION_DAYS = 7;
const GOVERNANCE_QUORUM = 100;

function enrichGovernanceProposal(proposal: StoredGovernanceProposal): GovernanceProposal {
  const remainingSeconds = Math.max(
    0,
    Math.floor((new Date(proposal.expiresAt).getTime() - Date.now()) / 1000)
  );

  const totalVotes = proposal.votesFor + proposal.votesAgainst;

  return {
    ...proposal,
    totalVotes,
    quorum: GOVERNANCE_QUORUM,
    quorumReached: totalVotes >= GOVERNANCE_QUORUM,
    remainingSeconds,
  };
}

async function getProposalStatus(
  proposal: StoredGovernanceProposal
): Promise<GovernanceProposalStatus> {
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

  return resolvedProposals
    .map(enrichGovernanceProposal)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
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

  const proposal: StoredGovernanceProposal = {
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

  return enrichGovernanceProposal(await createStoredGovernanceProposal(proposal));
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

  return enrichGovernanceProposal(await updateStoredGovernanceProposal(proposal));
}

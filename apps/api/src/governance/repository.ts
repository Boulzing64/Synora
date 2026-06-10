export type GovernanceVoteChoice = "FOR" | "AGAINST";

export type GovernanceProposalStatus = "ACTIVE" | "CLOSED";

export type GovernanceProposal = {
  id: string;
  title: string;
  description: string;
  creatorWallet: string;
  status: GovernanceProposalStatus;
  votesFor: number;
  votesAgainst: number;
  createdAt: string;
  expiresAt: string;
};

const PROPOSAL_DURATION_DAYS = 7;

const proposals = new Map<string, GovernanceProposal>();
const votes = new Map<string, Set<string>>();

function getProposalStatus(proposal: GovernanceProposal): GovernanceProposalStatus {
  if (proposal.status === "CLOSED") {
    return "CLOSED";
  }

  if (Date.now() >= new Date(proposal.expiresAt).getTime()) {
    proposal.status = "CLOSED";
    proposals.set(proposal.id, proposal);
    return "CLOSED";
  }

  return "ACTIVE";
}

export function listGovernanceProposals() {
  return Array.from(proposals.values())
    .map((proposal) => ({
      ...proposal,
      status: getProposalStatus(proposal),
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function createGovernanceProposal(params: {
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

  proposals.set(id, proposal);
  votes.set(id, new Set());

  return proposal;
}

export function voteGovernanceProposal(params: {
  proposalId: string;
  walletAddress: string;
  choice: GovernanceVoteChoice;
  weight: number;
}) {
  const proposal = proposals.get(params.proposalId);

  if (!proposal) {
    return null;
  }

  if (getProposalStatus(proposal) !== "ACTIVE") {
    throw new Error("GOVERNANCE_PROPOSAL_CLOSED");
  }

  const proposalVotes = votes.get(params.proposalId) ?? new Set<string>();

  if (proposalVotes.has(params.walletAddress)) {
    throw new Error("WALLET_ALREADY_VOTED");
  }

  proposalVotes.add(params.walletAddress);
  votes.set(params.proposalId, proposalVotes);

  if (params.choice === "FOR") {
    proposal.votesFor += params.weight;
  } else {
    proposal.votesAgainst += params.weight;
  }

  proposals.set(params.proposalId, proposal);

  return proposal;
}

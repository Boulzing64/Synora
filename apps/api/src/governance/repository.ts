export type GovernanceVoteChoice = "FOR" | "AGAINST";

export type GovernanceProposal = {
  id: string;
  title: string;
  description: string;
  creatorWallet: string;
  status: "ACTIVE";
  votesFor: number;
  votesAgainst: number;
  createdAt: string;
};

const proposals = new Map<string, GovernanceProposal>();
const votes = new Map<string, Set<string>>();

export function listGovernanceProposals() {
  return Array.from(proposals.values()).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
}

export function createGovernanceProposal(params: {
  title: string;
  description: string;
  creatorWallet: string;
}) {
  const id = crypto.randomUUID();

  const proposal: GovernanceProposal = {
    id,
    title: params.title,
    description: params.description,
    creatorWallet: params.creatorWallet,
    status: "ACTIVE",
    votesFor: 0,
    votesAgainst: 0,
    createdAt: new Date().toISOString(),
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
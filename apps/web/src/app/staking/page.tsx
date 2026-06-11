"use client";

import { useEffect, useState } from "react";

import {
  ProtocolNotice,
  ProtocolSectionTitle,
  ProtocolStat,
} from "@/components/ProtocolUi";
import { SynoraShell } from "@/components/SynoraShell";
import {
  BASE_SEPOLIA_CHAIN_ID_HEX,
  BASE_SEPOLIA_EXPLORER_URL,
} from "@/lib/chain";
import {
  approveSynForStaking,
  getStakingOnChainProfile,
  getSynStakingAllowance,
  stakeSyn,
  unstakeSyn,
} from "@/lib/synStaking";
import { getSynBalance } from "@/lib/synToken";

type Locale = "fr" | "en";
type TransactionKind = "approve" | "stake" | "unstake";

const text = {
  fr: {
    title: "Staking",
    subtitle:
      "Engage tes SYN pour renforcer ton poids de reputation et participer a la gouvernance.",
    overview: "Position on-chain",
    overviewTitle: "Ton capital utile dans SYNORA",
    overviewDescription:
      "Le staking donne du poids aux actions utiles sans bloquer la transparence du protocole.",
    connect: "Connecter le wallet",
    connected: "Wallet connecte",
    refresh: "Actualiser",
    approve: "1. Autoriser",
    stake: "2. Staker",
    unstake: "Retirer",
    wallet: "Wallet",
    balance: "Disponible",
    staked: "Ta position",
    totalStaked: "Total protocole",
    allowance: "Autorisation",
    amount: "Montant en SYN",
    actionEyebrow: "Console staking",
    actionTitle: "Gerer ta position",
    actionDescription:
      "Autorise d'abord le contrat, puis stake le montant choisi. Tu gardes le controle de ton retrait.",
    ready: "Pret a interagir sur Base Sepolia.",
    noWallet: "Connecte ton wallet pour utiliser le staking.",
    loading: "Confirmation demandee dans ton wallet...",
    metamaskMissing: "MetaMask est introuvable.",
    transactionSent: "Transaction envoyee",
    viewTransaction: "Voir sur BaseScan",
    approved: "Autorisation envoyee.",
    stakedAction: "Staking envoye.",
    unstakedAction: "Retrait envoye.",
    stepApproval: "Autorisation",
    stepApprovalText: "Permet au contrat de recevoir le montant choisi.",
    stepStake: "Staking",
    stepStakeText: "Active ton poids dans l'ecosysteme SYNORA.",
    stepControl: "Controle",
    stepControlText: "Retire tes SYN lorsque tu le souhaites.",
    network: "Reseau",
    networkValue: "Base Sepolia",
  },
  en: {
    title: "Staking",
    subtitle:
      "Commit your SYN to strengthen your reputation weight and join governance.",
    overview: "On-chain position",
    overviewTitle: "Your useful capital in SYNORA",
    overviewDescription:
      "Staking gives weight to useful actions while keeping the protocol transparent.",
    connect: "Connect wallet",
    connected: "Wallet connected",
    refresh: "Refresh",
    approve: "1. Approve",
    stake: "2. Stake",
    unstake: "Withdraw",
    wallet: "Wallet",
    balance: "Available",
    staked: "Your position",
    totalStaked: "Protocol total",
    allowance: "Allowance",
    amount: "Amount in SYN",
    actionEyebrow: "Staking console",
    actionTitle: "Manage your position",
    actionDescription:
      "Approve the contract first, then stake the selected amount. You retain withdrawal control.",
    ready: "Ready to interact on Base Sepolia.",
    noWallet: "Connect your wallet to use staking.",
    loading: "Confirmation requested in your wallet...",
    metamaskMissing: "MetaMask was not found.",
    transactionSent: "Transaction sent",
    viewTransaction: "View on BaseScan",
    approved: "Approval submitted.",
    stakedAction: "Stake submitted.",
    unstakedAction: "Withdrawal submitted.",
    stepApproval: "Approval",
    stepApprovalText: "Allows the contract to receive the selected amount.",
    stepStake: "Staking",
    stepStakeText: "Activates your weight in the SYNORA ecosystem.",
    stepControl: "Control",
    stepControlText: "Withdraw your SYN whenever you choose.",
    network: "Network",
    networkValue: "Base Sepolia",
  },
} as const;

function formatWallet(walletAddress: string) {
  return `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
}

export default function StakingPage() {
  const [locale, setLocale] = useState<Locale>("fr");
  const [walletAddress, setWalletAddress] = useState("");
  const [amountSyn, setAmountSyn] = useState("10");
  const [synBalance, setSynBalance] = useState("0");
  const [stakedBalance, setStakedBalance] = useState("0");
  const [totalStaked, setTotalStaked] = useState("0");
  const [allowance, setAllowance] = useState("0");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [transactionHash, setTransactionHash] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedLocale = window.localStorage.getItem("synora.locale");

    if (savedLocale === "fr" || savedLocale === "en") {
      queueMicrotask(() => setLocale(savedLocale));
    }

    function onLocaleChange(event: Event) {
      const customEvent = event as CustomEvent<Locale>;

      if (customEvent.detail === "fr" || customEvent.detail === "en") {
        setLocale(customEvent.detail);
      }
    }

    window.addEventListener("synora-locale-change", onLocaleChange);
    return () => window.removeEventListener("synora-locale-change", onLocaleChange);
  }, []);

  async function switchToBaseSepolia() {
    if (!window.ethereum) {
      throw new Error(text[locale].metamaskMissing);
    }

    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: BASE_SEPOLIA_CHAIN_ID_HEX }],
    });
  }

  async function refresh(wallet = walletAddress) {
    if (!wallet) return;

    const [balanceResponse, stakingResponse, allowanceResponse] =
      await Promise.all([
        getSynBalance(wallet),
        getStakingOnChainProfile(wallet),
        getSynStakingAllowance(wallet),
      ]);

    setSynBalance(Number(balanceResponse.formattedBalance).toLocaleString("fr-FR"));
    setStakedBalance(
      Number(stakingResponse.formattedStakedBalance).toLocaleString("fr-FR")
    );
    setTotalStaked(
      Number(stakingResponse.formattedTotalStaked).toLocaleString("fr-FR")
    );
    setAllowance((Number(allowanceResponse) / 10 ** 18).toLocaleString("fr-FR"));
  }

  async function connectWallet() {
    setError("");
    setStatus("");
    setTransactionHash("");

    try {
      if (!window.ethereum) throw new Error(text[locale].metamaskMissing);
      await switchToBaseSepolia();

      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];
      const wallet = accounts[0];

      if (!wallet) throw new Error("Wallet not found.");

      setWalletAddress(wallet);
      await refresh(wallet);
      setStatus(text[locale].ready);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Unknown wallet error."
      );
    }
  }

  async function runTransaction(kind: TransactionKind) {
    if (!walletAddress) {
      setError(text[locale].noWallet);
      return;
    }

    setIsLoading(true);
    setError("");
    setTransactionHash("");

    try {
      setStatus(text[locale].loading);
      await switchToBaseSepolia();

      const hash =
        kind === "approve"
          ? await approveSynForStaking({ walletAddress, amountSyn })
          : kind === "stake"
            ? await stakeSyn({ walletAddress, amountSyn })
            : await unstakeSyn({ walletAddress, amountSyn });

      setTransactionHash(hash);
      setStatus(
        kind === "approve"
          ? text[locale].approved
          : kind === "stake"
            ? text[locale].stakedAction
            : text[locale].unstakedAction
      );
      await refresh();
    } catch (caughtError) {
      setStatus("");
      setError(
        caughtError instanceof Error ? caughtError.message : "Transaction failed."
      );
    } finally {
      setIsLoading(false);
    }
  }

  const t = text[locale];
  const amountIsValid = Number(amountSyn) > 0;

  return (
    <SynoraShell title={t.title} subtitle={t.subtitle}>
      <div className="grid gap-6">
        <section className="premium-panel overflow-hidden rounded-[28px] p-5 sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <ProtocolSectionTitle
              eyebrow={t.overview}
              title={t.overviewTitle}
              description={t.overviewDescription}
            />
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={connectWallet}
                disabled={isLoading}
                className="rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 disabled:opacity-50"
              >
                {walletAddress ? t.connected : t.connect}
              </button>
              <button
                type="button"
                onClick={() => refresh()}
                disabled={isLoading || !walletAddress}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:border-cyan-300/30 hover:bg-white/10 disabled:opacity-40"
              >
                {t.refresh}
              </button>
            </div>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <ProtocolStat
              label={t.wallet}
              value={walletAddress ? formatWallet(walletAddress) : "-"}
              detail={`${t.network}: ${t.networkValue}`}
            />
            <ProtocolStat
              label={t.balance}
              value={`${synBalance} SYN`}
              detail={t.balance}
              accent="violet"
            />
            <ProtocolStat
              label={t.staked}
              value={`${stakedBalance} SYN`}
              detail={t.stepStakeText}
              accent="emerald"
            />
            <ProtocolStat
              label={t.totalStaked}
              value={`${totalStaked} SYN`}
              detail={`${t.allowance}: ${allowance} SYN`}
              accent="amber"
            />
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="premium-panel rounded-[28px] p-5 sm:p-7">
            <ProtocolSectionTitle
              eyebrow={t.actionEyebrow}
              title={t.actionTitle}
              description={t.actionDescription}
            />

            <label className="mt-7 block text-sm font-semibold text-slate-300">
              {t.amount}
              <div className="mt-2 flex rounded-2xl border border-white/10 bg-slate-950/70 p-1 focus-within:border-cyan-300/40">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={amountSyn}
                  onChange={(event) => setAmountSyn(event.target.value)}
                  className="min-w-0 flex-1 bg-transparent px-4 py-3 text-xl font-bold text-white outline-none"
                />
                <span className="flex items-center rounded-xl bg-white/5 px-4 text-sm font-bold text-cyan-200">
                  SYN
                </span>
              </div>
            </label>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => runTransaction("approve")}
                disabled={isLoading || !walletAddress || !amountIsValid}
                className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-3 font-bold text-cyan-100 transition hover:bg-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {t.approve}
              </button>
              <button
                type="button"
                onClick={() => runTransaction("stake")}
                disabled={isLoading || !walletAddress || !amountIsValid}
                className="rounded-2xl bg-emerald-300 px-4 py-3 font-bold text-slate-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {t.stake}
              </button>
              <button
                type="button"
                onClick={() => runTransaction("unstake")}
                disabled={isLoading || !walletAddress || !amountIsValid}
                className="rounded-2xl border border-amber-300/30 bg-amber-300/10 px-4 py-3 font-bold text-amber-100 transition hover:bg-amber-300/20 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {t.unstake}
              </button>
            </div>

            {status ? (
              <div className="mt-5">
                <ProtocolNotice
                  title={transactionHash ? t.transactionSent : undefined}
                  tone="cyan"
                >
                  <p>{status}</p>
                  {transactionHash ? (
                    <a
                      href={`${BASE_SEPOLIA_EXPLORER_URL}/tx/${transactionHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex font-bold text-white underline decoration-cyan-300/50 underline-offset-4"
                    >
                      {t.viewTransaction}
                    </a>
                  ) : null}
                </ProtocolNotice>
              </div>
            ) : null}

            {error ? (
              <div className="mt-5">
                <ProtocolNotice tone="red">{error}</ProtocolNotice>
              </div>
            ) : null}
          </div>

          <aside className="premium-panel rounded-[28px] p-5 sm:p-7">
            <ProtocolSectionTitle
              eyebrow="Workflow"
              title="3 actions, controle total"
            />
            <div className="mt-6 space-y-4">
              {[
                [t.stepApproval, t.stepApprovalText, "01"],
                [t.stepStake, t.stepStakeText, "02"],
                [t.stepControl, t.stepControlText, "03"],
              ].map(([label, detail, number]) => (
                <div
                  key={label}
                  className="premium-card flex gap-4 rounded-2xl p-4"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-300/10 font-mono text-xs font-bold text-cyan-200">
                    {number}
                  </span>
                  <div>
                    <p className="font-bold text-white">{label}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-400">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </section>
      </div>
    </SynoraShell>
  );
}

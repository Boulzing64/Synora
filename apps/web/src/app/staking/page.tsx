"use client";

import { useEffect, useState } from "react";

import { SynoraShell } from "@/components/SynoraShell";
import { BASE_SEPOLIA_CHAIN_ID_HEX } from "@/lib/chain";
import {
  approveSynForStaking,
  getStakingOnChainProfile,
  getSynStakingAllowance,
  stakeSyn,
  unstakeSyn,
} from "@/lib/synStaking";
import { getSynBalance } from "@/lib/synToken";

type Locale = "fr" | "en";

const text = {
  fr: {
    title: "Staking",
    subtitle:
      "Stake tes SYN pour preparer la reputation avancee et la future gouvernance SYNORA.",
    connect: "Connecter wallet",
    refresh: "Actualiser",
    approve: "Approve SYN",
    stake: "Stake",
    unstake: "Unstake",
    wallet: "Wallet",
    balance: "Balance SYN",
    staked: "SYN stakes",
    totalStaked: "Total stake",
    allowance: "Allowance staking",
    amount: "Montant SYN",
    statusReady: "Pret",
    noWallet: "Connecte ton wallet pour utiliser le staking.",
    loading: "Transaction en cours...",
    metamaskMissing: "MetaMask est introuvable.",
  },
  en: {
    title: "Staking",
    subtitle:
      "Stake your SYN to prepare advanced reputation and future SYNORA governance.",
    connect: "Connect wallet",
    refresh: "Refresh",
    approve: "Approve SYN",
    stake: "Stake",
    unstake: "Unstake",
    wallet: "Wallet",
    balance: "SYN balance",
    staked: "Staked SYN",
    totalStaked: "Total staked",
    allowance: "Staking allowance",
    amount: "SYN amount",
    statusReady: "Ready",
    noWallet: "Connect your wallet to use staking.",
    loading: "Transaction pending...",
    metamaskMissing: "MetaMask not found.",
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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedLocale = window.localStorage.getItem("synora.locale");

    if (savedLocale === "fr" || savedLocale === "en") {
      setLocale(savedLocale);
    }

    function onLocaleChange(event: Event) {
      const customEvent = event as CustomEvent<Locale>;

      if (customEvent.detail === "fr" || customEvent.detail === "en") {
        setLocale(customEvent.detail);
      }
    }

    window.addEventListener("synora-locale-change", onLocaleChange);

    return () => {
      window.removeEventListener("synora-locale-change", onLocaleChange);
    };
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
    if (!wallet) {
      return;
    }

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

    try {
      if (!window.ethereum) {
        throw new Error(text[locale].metamaskMissing);
      }

      await switchToBaseSepolia();

      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];

      const wallet = accounts[0];

      if (!wallet) {
        throw new Error("Wallet not found.");
      }

      setWalletAddress(wallet);
      await refresh(wallet);
      setStatus(text[locale].statusReady);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Unknown wallet error."
      );
    }
  }

  async function approve() {
    if (!walletAddress) {
      setError(text[locale].noWallet);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      setStatus(text[locale].loading);
      await switchToBaseSepolia();
      const hash = await approveSynForStaking({ walletAddress, amountSyn });
      setStatus(`Approve tx: ${hash}`);
      await refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Approve failed.");
    } finally {
      setIsLoading(false);
    }
  }

  async function stake() {
    if (!walletAddress) {
      setError(text[locale].noWallet);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      setStatus(text[locale].loading);
      await switchToBaseSepolia();
      const hash = await stakeSyn({ walletAddress, amountSyn });
      setStatus(`Stake tx: ${hash}`);
      await refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Stake failed.");
    } finally {
      setIsLoading(false);
    }
  }

  async function unstake() {
    if (!walletAddress) {
      setError(text[locale].noWallet);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      setStatus(text[locale].loading);
      await switchToBaseSepolia();
      const hash = await unstakeSyn({ walletAddress, amountSyn });
      setStatus(`Unstake tx: ${hash}`);
      await refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unstake failed.");
    } finally {
      setIsLoading(false);
    }
  }

  const t = text[locale];

  return (
    <SynoraShell title={t.title} subtitle={t.subtitle}>
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
            <p className="text-sm text-slate-400">{t.wallet}</p>
            <p className="mt-2 break-all font-mono text-sm">
              {walletAddress ? formatWallet(walletAddress) : "-"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
            <p className="text-sm text-slate-400">{t.balance}</p>
            <p className="mt-2 text-3xl font-bold">{synBalance}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
            <p className="text-sm text-slate-400">{t.staked}</p>
            <p className="mt-2 text-3xl font-bold">{stakedBalance}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
            <p className="text-sm text-slate-400">{t.totalStaked}</p>
            <p className="mt-2 text-3xl font-bold">{totalStaked}</p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950 p-5">
          <p className="text-sm text-slate-400">{t.allowance}</p>
          <p className="mt-2 text-xl font-bold">{allowance} SYN</p>
        </div>

        <div className="mt-6 flex flex-col gap-3 md:flex-row">
          <input
            value={amountSyn}
            onChange={(event) => setAmountSyn(event.target.value)}
            placeholder={t.amount}
            className="min-w-0 flex-1 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
          />

          <button
            type="button"
            onClick={connectWallet}
            disabled={isLoading}
            className="rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-60"
          >
            {t.connect}
          </button>

          <button
            type="button"
            onClick={() => refresh()}
            disabled={isLoading || !walletAddress}
            className="rounded-2xl border border-slate-700 px-5 py-3 font-bold text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {t.refresh}
          </button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <button
            type="button"
            onClick={approve}
            disabled={isLoading || !walletAddress}
            className="rounded-2xl border border-cyan-500 px-5 py-3 font-bold text-cyan-200 transition hover:bg-cyan-950 disabled:opacity-60"
          >
            {t.approve}
          </button>

          <button
            type="button"
            onClick={stake}
            disabled={isLoading || !walletAddress}
            className="rounded-2xl border border-emerald-500 px-5 py-3 font-bold text-emerald-200 transition hover:bg-emerald-950 disabled:opacity-60"
          >
            {t.stake}
          </button>

          <button
            type="button"
            onClick={unstake}
            disabled={isLoading || !walletAddress}
            className="rounded-2xl border border-orange-500 px-5 py-3 font-bold text-orange-200 transition hover:bg-orange-950 disabled:opacity-60"
          >
            {t.unstake}
          </button>
        </div>

        {status ? (
          <div className="mt-5 rounded-2xl border border-cyan-500/30 bg-cyan-950/30 p-4 text-sm text-cyan-100">
            {status}
          </div>
        ) : null}

        {error ? (
          <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-950/30 p-4 text-sm text-red-200">
            {error}
          </div>
        ) : null}
      </div>
    </SynoraShell>
  );
}
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ProtocolNotice, ProtocolSectionTitle } from "@/components/ProtocolUi";
import { SynoraShell } from "@/components/SynoraShell";
import {
  getEmailAccount,
  linkEmailWallet,
  requestEmailMagicLink,
  verifyEmailMagicLink,
  type EmailAccount,
} from "@/lib/api";

const EMAIL_SESSION_KEY = "synora.emailAuthToken";
const WALLET_SESSION_KEY = "synora.authToken";

function shortWallet(walletAddress: string) {
  return `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
}

export default function ConnexionPage() {
  const [email, setEmail] = useState("");
  const [emailToken, setEmailToken] = useState("");
  const [account, setAccount] = useState<EmailAccount | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    async function restoreOrVerify() {
      const magicToken = new URLSearchParams(window.location.search).get("token");

      try {
        if (magicToken) {
          if (active) {
            setLoading(true);
            setStatus("Verification du lien securise...");
          }
          const response = await verifyEmailMagicLink(magicToken);
          window.localStorage.setItem(EMAIL_SESSION_KEY, response.token);
          window.history.replaceState({}, "", "/connexion");

          if (active) {
            setEmailToken(response.token);
            setAccount(response.account);
            setStatus("Connexion email reussie.");
          }
          return;
        }

        const savedToken = window.localStorage.getItem(EMAIL_SESSION_KEY);
        if (!savedToken) return;

        const response = await getEmailAccount(savedToken);
        if (active) {
          setEmailToken(savedToken);
          setAccount(response.account);
          setStatus("Session email restauree.");
        }
      } catch (caughtError) {
        window.localStorage.removeItem(EMAIL_SESSION_KEY);
        if (active) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Le lien est invalide ou expire."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    const timeout = window.setTimeout(() => void restoreOrVerify(), 0);
    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, []);

  async function sendMagicLink() {
    if (!email.trim()) {
      setError("Entre une adresse email valide.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setStatus("Envoi du lien de connexion...");
      const response = await requestEmailMagicLink(email.trim());
      setStatus(
        `Lien envoye. Il reste valable jusqu'a ${new Date(
          response.expiresAt
        ).toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        })}.`
      );
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "Envoi impossible.";
      setError(
        message === "EMAIL_PROVIDER_NOT_CONFIGURED"
          ? "L'envoi email est en cours d'activation par SYNORA."
          : message
      );
      setStatus("");
    } finally {
      setLoading(false);
    }
  }

  async function linkWallet() {
    const walletToken = window.localStorage.getItem(WALLET_SESSION_KEY);

    if (!emailToken || !walletToken) {
      setError(
        "Authentifie d'abord ton wallet depuis le dashboard, puis reviens ici."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");
      setStatus("Association du wallet...");
      const response = await linkEmailWallet(emailToken, walletToken);
      setAccount(response.account);
      setStatus("Wallet associe a ton compte SYNORA.");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Association impossible."
      );
    } finally {
      setLoading(false);
    }
  }

  function disconnectEmail() {
    window.localStorage.removeItem(EMAIL_SESSION_KEY);
    setEmailToken("");
    setAccount(null);
    setStatus("Session email fermee.");
    setError("");
  }

  return (
    <SynoraShell
      title="Connexion SYNORA"
      subtitle="Entre avec un lien magique, puis associe ton wallet uniquement lorsque tu souhaites utiliser les fonctions Web3."
    >
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="premium-panel rounded-[28px] p-5 sm:p-7">
          {account ? (
            <>
              <ProtocolSectionTitle
                eyebrow="Compte actif"
                title="Bienvenue dans SYNORA"
                description="Ton email sert a retrouver ton profil. Les transactions restent toujours validees par ton wallet."
              />

              <div className="mt-6 grid gap-3">
                <div className="premium-card rounded-2xl p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    Email
                  </p>
                  <p className="mt-2 font-bold text-white">{account.email}</p>
                </div>
                <div className="premium-card rounded-2xl p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    Wallet associe
                  </p>
                  <p className="mt-2 font-mono font-bold text-white">
                    {account.walletAddress
                      ? shortWallet(account.walletAddress)
                      : "Aucun wallet associe"}
                  </p>
                </div>
              </div>

              {!account.walletAddress ? (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Link
                    href="/dashboard"
                    className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-white/10"
                  >
                    Authentifier le wallet
                  </Link>
                  <button
                    type="button"
                    onClick={linkWallet}
                    disabled={loading}
                    className="rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-200 disabled:opacity-50"
                  >
                    Associer maintenant
                  </button>
                </div>
              ) : (
                <Link
                  href="/dashboard"
                  className="mt-5 inline-flex rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-200"
                >
                  Ouvrir mon dashboard
                </Link>
              )}

              <button
                type="button"
                onClick={disconnectEmail}
                className="mt-5 block text-sm font-bold text-slate-500 hover:text-red-200"
              >
                Fermer la session email
              </button>
            </>
          ) : (
            <>
              <ProtocolSectionTitle
                eyebrow="Sans mot de passe"
                title="Recevoir un lien magique"
                description="Aucun mot de passe a memoriser. Le lien est unique, valable 15 minutes et ne peut etre utilise qu'une fois."
              />

              <label className="mt-6 block text-sm font-bold text-slate-300">
                Adresse email
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") void sendMagicLink();
                  }}
                  placeholder="toi@exemple.com"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-cyan-300/40"
                />
              </label>

              <button
                type="button"
                onClick={sendMagicLink}
                disabled={loading}
                className="mt-4 w-full rounded-2xl bg-cyan-300 px-5 py-3.5 text-sm font-black text-slate-950 transition hover:bg-cyan-200 disabled:opacity-50"
              >
                {loading ? "Envoi..." : "Recevoir mon lien"}
              </button>
            </>
          )}

          {status ? (
            <div className="mt-5">
              <ProtocolNotice tone="cyan">{status}</ProtocolNotice>
            </div>
          ) : null}
          {error ? (
            <div className="mt-5">
              <ProtocolNotice tone="red">{error}</ProtocolNotice>
            </div>
          ) : null}
        </section>

        <aside className="premium-panel rounded-[28px] p-5 sm:p-7">
          <ProtocolSectionTitle
            eyebrow="Double securite"
            title="Email pour entrer, wallet pour agir"
            description="Cette separation rend SYNORA plus accessible sans diminuer la securite des actions blockchain."
          />
          <div className="mt-6 space-y-3">
            {[
              ["01", "Explorer", "L'email ouvre le profil et l'onboarding."],
              ["02", "Associer", "Le wallet est relie apres une vraie signature."],
              ["03", "Valider", "Chaque transaction reste confirmee dans MetaMask."],
            ].map(([number, title, detail]) => (
              <div key={number} className="premium-card flex gap-4 rounded-2xl p-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-violet-300/10 font-mono text-xs font-bold text-violet-200">
                  {number}
                </span>
                <div>
                  <p className="font-bold text-white">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-400">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </SynoraShell>
  );
}

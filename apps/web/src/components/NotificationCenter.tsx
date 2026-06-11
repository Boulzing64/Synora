"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  getNotifications,
  type SynoraNotification,
  type SynoraNotificationKind,
} from "@/lib/api";
import { BASE_SEPOLIA_EXPLORER_URL } from "@/lib/chain";

type Locale = "fr" | "en";

const SESSION_STORAGE_KEY = "synora.authToken";
const READ_STORAGE_PREFIX = "synora.notifications.read";

const notificationStyles: Record<
  SynoraNotificationKind,
  { icon: string; color: string }
> = {
  BETA_TRANSACTION_CONFIRMED: {
    icon: "OK",
    color: "border-emerald-300/20 bg-emerald-300/10 text-emerald-200",
  },
  BETA_REWARD_READY: {
    icon: "S",
    color: "border-cyan-300/20 bg-cyan-300/10 text-cyan-200",
  },
  REWARD_AVAILABLE: {
    icon: "+",
    color: "border-amber-300/20 bg-amber-300/10 text-amber-200",
  },
  REWARD_CLAIMED: {
    icon: "R",
    color: "border-emerald-300/20 bg-emerald-300/10 text-emerald-200",
  },
  REPUTATION_EVENT: {
    icon: "RP",
    color: "border-violet-300/20 bg-violet-300/10 text-violet-200",
  },
  GOVERNANCE_PROPOSAL: {
    icon: "V",
    color: "border-cyan-300/20 bg-cyan-300/10 text-cyan-200",
  },
};

function readStorageKey(walletAddress: string) {
  return `${READ_STORAGE_PREFIX}.${walletAddress.toLowerCase()}`;
}

function getStoredReadIds(walletAddress: string) {
  try {
    const value = window.localStorage.getItem(readStorageKey(walletAddress));
    const parsed = value ? (JSON.parse(value) as unknown) : [];
    return Array.isArray(parsed)
      ? new Set(parsed.filter((item): item is string => typeof item === "string"))
      : new Set<string>();
  } catch {
    return new Set<string>();
  }
}

function getNotificationCopy(notification: SynoraNotification, locale: Locale) {
  const amount = Number(notification.data.amount ?? 0);

  if (notification.kind === "BETA_TRANSACTION_CONFIRMED") {
    return locale === "fr"
      ? {
          title: "Transaction beta confirmee",
          message: `${amount} SYN ont ete distribues sur Base Sepolia.`,
        }
      : {
          title: "Beta transaction confirmed",
          message: `${amount} SYN were distributed on Base Sepolia.`,
        };
  }

  if (notification.kind === "BETA_REWARD_READY") {
    return locale === "fr"
      ? {
          title: "Tes SYN beta sont prets",
          message: `${amount} SYN attendent ta confirmation on-chain.`,
        }
      : {
          title: "Your beta SYN are ready",
          message: `${amount} SYN are waiting for your on-chain confirmation.`,
        };
  }

  if (notification.kind === "REWARD_AVAILABLE") {
    return locale === "fr"
      ? {
          title: "Reward disponible",
          message: `${amount} SYN peuvent etre reclames depuis le dashboard.`,
        }
      : {
          title: "Reward available",
          message: `${amount} SYN can be claimed from the dashboard.`,
        };
  }

  if (notification.kind === "REWARD_CLAIMED") {
    return locale === "fr"
      ? {
          title: "Reward enregistre",
          message: `${amount} SYN ont ete ajoutes a ton historique.`,
        }
      : {
          title: "Reward recorded",
          message: `${amount} SYN were added to your history.`,
        };
  }

  if (notification.kind === "GOVERNANCE_PROPOSAL") {
    return locale === "fr"
      ? {
          title: "Nouvelle proposition",
          message: String(notification.data.title ?? "Proposition SYNORA"),
        }
      : {
          title: "New proposal",
          message: String(notification.data.title ?? "SYNORA proposal"),
        };
  }

  const eventType = String(notification.data.eventType ?? "");
  const eventLabels = {
    PROFILE_CREATED: locale === "fr" ? "Profil cree" : "Profile created",
    WALLET_AUTHENTICATED:
      locale === "fr" ? "Wallet authentifie" : "Wallet authenticated",
    SYN_BALANCE_CONNECTED:
      locale === "fr" ? "Balance SYN connectee" : "SYN balance connected",
  };

  return {
    title:
      eventLabels[eventType as keyof typeof eventLabels] ??
      (locale === "fr" ? "Reputation mise a jour" : "Reputation updated"),
    message:
      locale === "fr"
        ? `Ton profil est maintenant ${notification.data.level} avec un score de ${notification.data.score}.`
        : `Your profile is now ${notification.data.level} with a score of ${notification.data.score}.`,
  };
}

function formatRelativeDate(date: string, locale: Locale) {
  const elapsedSeconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  );

  if (elapsedSeconds < 60) return locale === "fr" ? "A l'instant" : "Just now";
  if (elapsedSeconds < 3600) {
    const minutes = Math.floor(elapsedSeconds / 60);
    return locale === "fr" ? `Il y a ${minutes} min` : `${minutes} min ago`;
  }
  if (elapsedSeconds < 86400) {
    const hours = Math.floor(elapsedSeconds / 3600);
    return locale === "fr" ? `Il y a ${hours} h` : `${hours} h ago`;
  }

  return new Date(date).toLocaleDateString(locale, {
    day: "2-digit",
    month: "short",
  });
}

export function NotificationCenter({ locale }: { locale: Locale }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [notifications, setNotifications] = useState<SynoraNotification[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadNotifications() {
      const token = window.localStorage.getItem(SESSION_STORAGE_KEY);

      if (!token) {
        if (active) {
          setWalletAddress("");
          setNotifications([]);
          setReadIds(new Set());
        }
        return;
      }

      try {
        if (active) setLoading(true);
        const response = await getNotifications(token);

        if (active) {
          setWalletAddress(response.walletAddress);
          setNotifications(response.notifications);
          setReadIds(getStoredReadIds(response.walletAddress));
        }
      } catch {
        if (active) {
          setWalletAddress("");
          setNotifications([]);
          setReadIds(new Set());
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    const deferredLoad = window.setTimeout(() => void loadNotifications(), 0);
    const interval = window.setInterval(() => void loadNotifications(), 60000);
    const refresh = () => void loadNotifications();

    window.addEventListener("synora-auth-change", refresh);
    window.addEventListener("synora-notifications-refresh", refresh);

    return () => {
      active = false;
      window.clearTimeout(deferredLoad);
      window.clearInterval(interval);
      window.removeEventListener("synora-auth-change", refresh);
      window.removeEventListener("synora-notifications-refresh", refresh);
    };
  }, []);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (
        open &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [open]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !readIds.has(notification.id)).length,
    [notifications, readIds]
  );

  function saveReadIds(nextReadIds: Set<string>) {
    setReadIds(nextReadIds);

    if (walletAddress) {
      window.localStorage.setItem(
        readStorageKey(walletAddress),
        JSON.stringify(Array.from(nextReadIds).slice(-100))
      );
    }
  }

  function markAsRead(notificationId: string) {
    const nextReadIds = new Set(readIds);
    nextReadIds.add(notificationId);
    saveReadIds(nextReadIds);
  }

  function markAllAsRead() {
    saveReadIds(new Set(notifications.map((notification) => notification.id)));
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="relative grid h-10 w-10 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-slate-300 transition hover:border-cyan-300/25 hover:text-white"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-[18px] w-[18px]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </svg>
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-cyan-300 px-1.5 py-0.5 text-center text-[10px] font-black text-slate-950 shadow-[0_0_16px_rgba(103,232,249,0.5)]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="fixed inset-x-4 top-[74px] z-50 overflow-hidden rounded-2xl border border-white/10 bg-[#07101e]/[0.98] shadow-2xl backdrop-blur-2xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 sm:w-[390px]">
          <div className="flex items-center justify-between border-b border-white/[0.07] p-4">
            <div>
              <p className="font-bold text-white">Notifications</p>
              <p className="mt-0.5 text-xs text-slate-500">
                {walletAddress
                  ? locale === "fr"
                    ? `${unreadCount} non lue${unreadCount > 1 ? "s" : ""}`
                    : `${unreadCount} unread`
                  : locale === "fr"
                    ? "Authentifie ton wallet"
                    : "Authenticate your wallet"}
              </p>
            </div>
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-xs font-bold text-cyan-200 transition hover:text-white"
              >
                {locale === "fr" ? "Tout lire" : "Mark all read"}
              </button>
            ) : null}
          </div>

          <div className="max-h-[min(70vh,560px)] overflow-y-auto p-2">
            {loading && notifications.length === 0 ? (
              <p className="p-6 text-center text-sm text-slate-400">
                {locale === "fr" ? "Chargement..." : "Loading..."}
              </p>
            ) : notifications.length === 0 ? (
              <div className="p-7 text-center">
                <p className="font-bold text-white">
                  {locale === "fr" ? "Rien de nouveau" : "Nothing new"}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {walletAddress
                    ? locale === "fr"
                      ? "Tes prochaines activites apparaitront ici."
                      : "Your next activities will appear here."
                    : locale === "fr"
                      ? "Connecte-toi depuis le dashboard pour activer ton centre personnel."
                      : "Connect from the dashboard to activate your personal center."}
                </p>
              </div>
            ) : (
              notifications.map((notification) => {
                const copy = getNotificationCopy(notification, locale);
                const isRead = readIds.has(notification.id);
                const transactionHash =
                  notification.kind === "BETA_TRANSACTION_CONFIRMED"
                    ? String(notification.data.transactionHash ?? "")
                    : "";

                return (
                  <article
                    key={notification.id}
                    className={`relative rounded-xl p-3 transition hover:bg-white/[0.04] ${
                      isRead ? "opacity-65" : "bg-white/[0.025]"
                    }`}
                  >
                    {!isRead ? (
                      <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-cyan-300" />
                    ) : null}
                    <div className="flex gap-3 pr-4">
                      <span
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border text-[10px] font-black ${notificationStyles[notification.kind].color}`}
                      >
                        {notificationStyles[notification.kind].icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <Link
                          href={notification.href}
                          onClick={() => {
                            markAsRead(notification.id);
                            setOpen(false);
                          }}
                          className="block"
                        >
                          <p className="text-sm font-bold text-white">{copy.title}</p>
                          <p className="mt-1 text-xs leading-5 text-slate-400">
                            {copy.message}
                          </p>
                          <p className="mt-2 text-[11px] text-slate-600">
                            {formatRelativeDate(notification.createdAt, locale)}
                          </p>
                        </Link>
                        {transactionHash ? (
                          <a
                            href={`${BASE_SEPOLIA_EXPLORER_URL}/tx/${transactionHash}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => markAsRead(notification.id)}
                            className="mt-2 inline-flex text-xs font-bold text-cyan-200 hover:text-white"
                          >
                            BaseScan
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

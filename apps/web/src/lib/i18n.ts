export type SynoraLocale = "fr" | "en";

export const translations = {
  fr: {
    language: "Langue",
    french: "Francais",
    english: "Anglais",
    dashboardTitle: "Wallet, SYN et reputation",
    dashboardSubtitle:
      "SYNORA lit la balance SYN, authentifie le wallet, affiche la€™historique recent et permet un claim de recompense MVP off-chain.",
    wallet: "Wallet",
    balance: "Balance SYN",
    status: "Statut",
    session: "Session",
    connected: "JWT recu",
    notAuthenticated: "Non authentifie",
    score: "Score",
    level: "Niveau",
    rewards: "Recompenses",
    events: "Ã‰venements",
    recentHistory: "Historique recent",
    connectSign: "Connecter, lire SYN et signer",
    refreshBalance: "Actualiser balance",
    claimReward: "Claim recompense MVP",
    testRewardsAuth: "Tester autorisation rewards",
    reset: "Reinitialiser",
    statusPage: "Voir le statut MVP",
    statusTitle: "Ã‰tat du MVP SYNORA",
    backDashboard: "Retour au dashboard",
  },
  en: {
    language: "Language",
    french: "French",
    english: "English",
    dashboardTitle: "Wallet, SYN and reputation",
    dashboardSubtitle:
      "SYNORA reads the SYN balance, authenticates the wallet, displays recent reputation history and enables an off-chain MVP reward claim.",
    wallet: "Wallet",
    balance: "SYN Balance",
    status: "Status",
    session: "Session",
    connected: "JWT received",
    notAuthenticated: "Not authenticated",
    score: "Score",
    level: "Level",
    rewards: "Rewards",
    events: "Events",
    recentHistory: "Recent history",
    connectSign: "Connect, read SYN and sign",
    refreshBalance: "Refresh balance",
    claimReward: "Claim MVP reward",
    testRewardsAuth: "Test rewards authorization",
    reset: "Reset",
    statusPage: "View MVP status",
    statusTitle: "SYNORA MVP Status",
    backDashboard: "Back to dashboard",
  },
} as const;

export function getInitialLocale(): SynoraLocale {
  if (typeof window === "undefined") {
    return "fr";
  }

  const savedLocale = window.localStorage.getItem("synora.locale");

  if (savedLocale === "en" || savedLocale === "fr") {
    return savedLocale;
  }

  return window.navigator.language.toLowerCase().startsWith("en") ? "en" : "fr";
}
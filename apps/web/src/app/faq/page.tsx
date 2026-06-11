"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { ProtocolNotice, ProtocolSectionTitle } from "@/components/ProtocolUi";
import { SynoraShell } from "@/components/SynoraShell";

type Locale = "fr" | "en";

type FaqItem = {
  category: string;
  question: string;
  answer: string;
  href?: string;
  linkLabel?: string;
};

const content: Record<
  Locale,
  {
    title: string;
    subtitle: string;
    search: string;
    empty: string;
    securityTitle: string;
    securityText: string;
    contactTitle: string;
    contactText: string;
    contactLink: string;
    items: FaqItem[];
  }
> = {
  fr: {
    title: "Questions frequentes",
    subtitle:
      "Les reponses essentielles pour tester SYNORA sereinement, comprendre les SYN de test et proteger ton wallet.",
    search: "Rechercher une question...",
    empty: "Aucune reponse ne correspond a cette recherche.",
    securityTitle: "Regle de securite absolue",
    securityText:
      "SYNORA ne demandera jamais ta phrase de recuperation, ta cle privee ou le mot de passe de ton wallet.",
    contactTitle: "Ta question n'est pas ici ?",
    contactText:
      "Utilise le centre d'aide IA ou envoie un retour structure apres ton test.",
    contactLink: "Ouvrir le formulaire de retour",
    items: [
      {
        category: "SYNORA",
        question: "Qu'est-ce que SYNORA ?",
        answer:
          "SYNORA est un protocole Web3 de reputation dynamique. Il transforme les actions utiles d'un wallet en score, badges, rewards et poids de gouvernance.",
      },
      {
        category: "Beta",
        question: "A quoi sert la Founding Beta ?",
        answer:
          "La beta sert a tester les parcours reels du produit avec 100 premiers utilisateurs, mesurer les blocages et ameliorer l'experience avant une ouverture plus large.",
        href: "/beta",
        linkLabel: "Voir le programme beta",
      },
      {
        category: "Beta",
        question: "Combien de temps faut-il pour participer ?",
        answer:
          "Le parcours initial demande environ 20 a 30 minutes. Tu peux ensuite revenir tester les ameliorations ou participer a la gouvernance.",
      },
      {
        category: "SYN",
        question: "Les SYN de test ont-ils une valeur financiere ?",
        answer:
          "Non. Les SYN distribues sur Base Sepolia sont des tokens de testnet. Ils ne constituent ni un investissement, ni une promesse de prix ou de rendement.",
      },
      {
        category: "SYN",
        question: "Comment recevoir mes 100 SYN de test ?",
        answer:
          "Authentifie ton wallet depuis le dashboard, ouvre la page Obtenir SYN, passe sur Base Sepolia puis confirme le claim dans ton wallet.",
        href: "/obtenir-syn",
        linkLabel: "Obtenir mes SYN",
      },
      {
        category: "Wallet",
        question: "Pourquoi dois-je signer un message ?",
        answer:
          "La signature prouve que tu controles le wallet sans envoyer de transaction et sans reveler ta cle privee. Elle permet a SYNORA de creer une session securisee.",
      },
      {
        category: "Wallet",
        question: "La signature wallet coute-t-elle des frais ?",
        answer:
          "Non. Signer le message de connexion ne coute aucun gas. Seules les transactions on-chain, comme un claim ou un stake, peuvent utiliser un peu d'ETH Base Sepolia.",
      },
      {
        category: "Wallet",
        question: "Que faire si MetaMask n'est pas sur Base Sepolia ?",
        answer:
          "SYNORA propose automatiquement de changer de reseau. Accepte la demande dans MetaMask. Le Chain ID de Base Sepolia est 84532.",
      },
      {
        category: "Securite",
        question: "SYNORA peut-il acceder a mes fonds ?",
        answer:
          "Non. SYNORA ne connait jamais ta cle privee. Chaque transaction doit etre verifiee et confirmee directement dans ton wallet.",
      },
      {
        category: "Securite",
        question: "Que ne dois-je jamais partager ?",
        answer:
          "Ne partage jamais ta seed phrase, ta phrase de recuperation, ta cle privee, un code de validation ou le mot de passe de ton wallet.",
      },
      {
        category: "Reputation",
        question: "Comment fonctionne le score de reputation ?",
        answer:
          "Le score augmente avec des actions verifiees comme l'authentification, la connexion de la balance SYN, le staking, les rewards et la participation utile.",
        href: "/reputation",
        linkLabel: "Comprendre ma reputation",
      },
      {
        category: "Staking",
        question: "Puis-je recuperer mes SYN stakes ?",
        answer:
          "Oui. Sur la version testnet actuelle, tu peux utiliser la fonction Unstake pour recuperer les SYN que tu as places dans le contrat.",
        href: "/staking",
        linkLabel: "Ouvrir le staking",
      },
      {
        category: "Rewards",
        question: "Pourquoi un reward peut-il etre refuse ?",
        answer:
          "Le wallet doit etre authentifie, respecter les conditions de reputation et ne pas avoir deja reclame le meme reward. Une autorisation expiree doit etre generee de nouveau.",
      },
      {
        category: "Compte",
        question: "Puis-je utiliser SYNORA avec un email ?",
        answer:
          "Oui. La connexion email utilise un lien magique sans mot de passe. Les fonctions blockchain demandent toujours d'associer et de confirmer le wallet.",
        href: "/connexion",
        linkLabel: "Connexion email",
      },
      {
        category: "Application",
        question: "Comment installer SYNORA sur mobile ?",
        answer:
          "Sur Android, utilise Chrome puis Installer l'application. Sur iPhone, ouvre Safari, touche Partager puis Sur l'ecran d'accueil.",
        href: "/download",
        linkLabel: "Guide d'installation",
      },
      {
        category: "Feedback",
        question: "Comment signaler un bug ou proposer une amelioration ?",
        answer:
          "Authentifie ton wallet puis utilise le formulaire de retour. Indique ton appareil, l'etape testee, le blocage rencontre et l'amelioration prioritaire.",
        href: "/feedback",
        linkLabel: "Envoyer un retour",
      },
    ],
  },
  en: {
    title: "Frequently asked questions",
    subtitle:
      "Essential answers to test SYNORA safely, understand test SYN and protect your wallet.",
    search: "Search for a question...",
    empty: "No answer matches this search.",
    securityTitle: "Absolute security rule",
    securityText:
      "SYNORA will never ask for your recovery phrase, private key or wallet password.",
    contactTitle: "Your question is not listed?",
    contactText:
      "Use the AI help center or send structured feedback after your test.",
    contactLink: "Open the feedback form",
    items: [
      {
        category: "SYNORA",
        question: "What is SYNORA?",
        answer:
          "SYNORA is a dynamic Web3 reputation protocol. It turns useful wallet actions into a score, badges, rewards and governance power.",
      },
      {
        category: "Beta",
        question: "What is the Founding Beta for?",
        answer:
          "The beta tests real product journeys with the first 100 users, measures friction and improves the experience before a wider release.",
        href: "/beta",
        linkLabel: "View the beta program",
      },
      {
        category: "Beta",
        question: "How long does participation take?",
        answer:
          "The initial journey takes about 20 to 30 minutes. You can return later to test improvements or take part in governance.",
      },
      {
        category: "SYN",
        question: "Do test SYN have financial value?",
        answer:
          "No. SYN distributed on Base Sepolia are testnet tokens. They are not an investment or a promise of price or yield.",
      },
      {
        category: "SYN",
        question: "How do I receive 100 test SYN?",
        answer:
          "Authenticate your wallet from the dashboard, open Get SYN, switch to Base Sepolia and confirm the claim in your wallet.",
        href: "/obtenir-syn",
        linkLabel: "Get my SYN",
      },
      {
        category: "Wallet",
        question: "Why do I need to sign a message?",
        answer:
          "The signature proves that you control the wallet without a transaction and without exposing your private key. It creates a secure SYNORA session.",
      },
      {
        category: "Wallet",
        question: "Does the wallet signature cost gas?",
        answer:
          "No. Signing the login message is free. Only on-chain transactions such as a claim or stake may use a small amount of Base Sepolia ETH.",
      },
      {
        category: "Wallet",
        question: "What if MetaMask is not on Base Sepolia?",
        answer:
          "SYNORA automatically requests a network switch. Accept it in MetaMask. The Base Sepolia Chain ID is 84532.",
      },
      {
        category: "Security",
        question: "Can SYNORA access my funds?",
        answer:
          "No. SYNORA never knows your private key. Every transaction must be reviewed and confirmed directly in your wallet.",
      },
      {
        category: "Security",
        question: "What should I never share?",
        answer:
          "Never share your seed phrase, recovery phrase, private key, verification code or wallet password.",
      },
      {
        category: "Reputation",
        question: "How does the reputation score work?",
        answer:
          "The score grows through verified actions such as authentication, connecting a SYN balance, staking, rewards and useful participation.",
        href: "/reputation",
        linkLabel: "Understand my reputation",
      },
      {
        category: "Staking",
        question: "Can I recover my staked SYN?",
        answer:
          "Yes. In the current testnet version, use Unstake to recover the SYN deposited in the staking contract.",
        href: "/staking",
        linkLabel: "Open staking",
      },
      {
        category: "Rewards",
        question: "Why can a reward be rejected?",
        answer:
          "The wallet must be authenticated, meet reputation conditions and must not have claimed the same reward already. An expired authorization must be generated again.",
      },
      {
        category: "Account",
        question: "Can I use SYNORA with email?",
        answer:
          "Yes. Email login uses a passwordless magic link. Blockchain features still require linking and confirming a wallet.",
        href: "/connexion",
        linkLabel: "Email sign-in",
      },
      {
        category: "Application",
        question: "How do I install SYNORA on mobile?",
        answer:
          "On Android, use Chrome and Install app. On iPhone, open Safari, tap Share and then Add to Home Screen.",
        href: "/download",
        linkLabel: "Installation guide",
      },
      {
        category: "Feedback",
        question: "How do I report a bug or suggest an improvement?",
        answer:
          "Authenticate your wallet and use the feedback form. Include your device, tested step, blocker and highest-priority improvement.",
        href: "/feedback",
        linkLabel: "Send feedback",
      },
    ],
  },
};

export default function FaqPage() {
  const [locale, setLocale] = useState<Locale>("fr");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const savedLocale = window.localStorage.getItem("synora.locale");

    if (savedLocale === "fr" || savedLocale === "en") {
      queueMicrotask(() => setLocale(savedLocale));
    }

    function onLocaleChange(event: Event) {
      const customEvent = event as CustomEvent<Locale>;
      if (customEvent.detail === "fr" || customEvent.detail === "en") {
        setLocale(customEvent.detail);
        setQuery("");
      }
    }

    window.addEventListener("synora-locale-change", onLocaleChange);
    return () =>
      window.removeEventListener("synora-locale-change", onLocaleChange);
  }, []);

  const t = content[locale];
  const normalizedQuery = query.trim().toLowerCase();
  const filteredItems = useMemo(
    () =>
      normalizedQuery
        ? t.items.filter((item) =>
            `${item.category} ${item.question} ${item.answer}`
              .toLowerCase()
              .includes(normalizedQuery)
          )
        : t.items,
    [normalizedQuery, t.items]
  );

  return (
    <SynoraShell title={t.title} subtitle={t.subtitle}>
      <div className="grid gap-6">
        <section className="premium-panel rounded-[28px] p-5 sm:p-7">
          <label className="block">
            <span className="sr-only">{t.search}</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t.search}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-5 py-4 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/40"
            />
          </label>

          <div className="mt-5">
            <ProtocolNotice tone="amber" title={t.securityTitle}>
              {t.securityText}
            </ProtocolNotice>
          </div>
        </section>

        <section className="grid gap-3">
          {filteredItems.length === 0 ? (
            <div className="premium-panel rounded-[24px] p-8 text-center text-slate-400">
              {t.empty}
            </div>
          ) : (
            filteredItems.map((item) => (
              <details
                key={item.question}
                className="premium-panel group rounded-[22px] p-5 open:border-cyan-300/25"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-white">
                  <span>
                    <span className="mb-2 block text-[10px] uppercase tracking-[0.18em] text-cyan-300">
                      {item.category}
                    </span>
                    {item.question}
                  </span>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 text-slate-400 transition group-open:rotate-45 group-open:text-cyan-200">
                    +
                  </span>
                </summary>
                <div className="mt-4 border-t border-white/[0.06] pt-4">
                  <p className="max-w-4xl text-sm leading-7 text-slate-400">
                    {item.answer}
                  </p>
                  {item.href && item.linkLabel ? (
                    <Link
                      href={item.href}
                      className="mt-3 inline-flex text-sm font-bold text-cyan-200 hover:text-white"
                    >
                      {item.linkLabel} -&gt;
                    </Link>
                  ) : null}
                </div>
              </details>
            ))
          )}
        </section>

        <section className="premium-panel rounded-[28px] p-5 sm:p-7">
          <ProtocolSectionTitle
            eyebrow="Support"
            title={t.contactTitle}
            description={t.contactText}
          />
          <Link
            href="/feedback"
            className="mt-5 inline-flex rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-200"
          >
            {t.contactLink}
          </Link>
        </section>
      </div>
    </SynoraShell>
  );
}

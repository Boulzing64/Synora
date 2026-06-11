import { InstallPwaButton } from "@/components/InstallPwaButton";
import { ProtocolSectionTitle } from "@/components/ProtocolUi";
import { SynoraShell } from "@/components/SynoraShell";

export default function DownloadPage() {
  return (
    <SynoraShell
      title="Installer SYNORA"
      subtitle="Utilise SYNORA comme une application sur mobile ou ordinateur, sans passer par un store."
    >
      <div className="grid gap-6">
        <section className="premium-panel rounded-[28px] p-5 sm:p-7">
          <div className="grid gap-7 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <ProtocolSectionTitle
                eyebrow="Progressive Web App"
                title="L'application SYNORA, directement depuis le site"
                description="L'installation PWA ajoute une icone sur ton appareil, ouvre SYNORA en plein ecran et conserve les pages essentielles disponibles."
              />
              <div className="mt-6 max-w-sm">
                <InstallPwaButton />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {[
                ["01", "Sans store", "Installation immediate depuis le navigateur."],
                ["02", "Toujours a jour", "Aucune nouvelle APK a telecharger."],
                ["03", "Multi-appareil", "Android, iPhone, Windows et macOS."],
              ].map(([number, title, detail]) => (
                <div key={number} className="premium-card flex gap-4 rounded-2xl p-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-cyan-300/10 font-mono text-xs font-bold text-cyan-200">
                    {number}
                  </span>
                  <div>
                    <p className="font-bold text-white">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-400">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          {[
            {
              title: "Android",
              steps: "Chrome → menu → Installer l'application",
            },
            {
              title: "iPhone / iPad",
              steps: "Safari → Partager → Sur l'ecran d'accueil",
            },
            {
              title: "Ordinateur",
              steps: "Chrome ou Edge → icone Installer dans la barre d'adresse",
            },
          ].map((platform) => (
            <article key={platform.title} className="premium-panel rounded-[24px] p-5">
              <p className="text-lg font-black text-white">{platform.title}</p>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                {platform.steps}
              </p>
            </article>
          ))}
        </section>

        <section className="rounded-[24px] border border-amber-300/20 bg-amber-300/[0.05] p-5">
          <p className="font-bold text-amber-100">Version Android technique</p>
          <p className="mt-2 text-sm leading-6 text-amber-100/70">
            L&apos;APK reste disponible pour les tests internes Capacitor. Pour les
            utilisateurs, la PWA est plus simple et toujours a jour.
          </p>
          <a
            href="/downloads/synora-beta-debug.apk"
            download
            className="mt-4 inline-flex text-sm font-bold text-amber-100 underline decoration-amber-300/40 underline-offset-4"
          >
            Telecharger l&apos;APK beta
          </a>
        </section>
      </div>
    </SynoraShell>
  );
}

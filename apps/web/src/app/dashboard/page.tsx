import { SynoraShell } from "@/components/SynoraShell";
import { WalletAuthCard } from "@/components/WalletAuthCard";

export default function DashboardPage() {
  return (
    <SynoraShell
      title="Ton identite Web3"
      subtitle="Suis ta reputation, comprends ta progression et choisis ta prochaine action utile dans l'ecosysteme SYNORA."
    >
      <WalletAuthCard />
    </SynoraShell>
  );
}

import { SynoraShell } from "@/components/SynoraShell";
import { WalletAuthCard } from "@/components/WalletAuthCard";

export default function DashboardPage() {
  return (
    <SynoraShell
      title="Dashboard"
      subtitle="Connect MetaMask, authenticate by signature, read SYN balance and manage rewards."
    >
      <WalletAuthCard />
    </SynoraShell>
  );
}
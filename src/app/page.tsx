import { BonsaiCard } from "@/components/BonsaiCard";
import { MintPanel } from "@/components/MintPanel";
import { VaultInfo } from "@/components/VaultInfo";
import { VAULT_BONSAI, VAULT_TOTAL_ETH } from "@/lib/contracts";

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-12">
      {/* Hero */}
      <section data-testid="hero" className="text-center space-y-4">
        <p className="text-xs uppercase tracking-[0.3em] text-vault-accent-dim">
          Bonsai Kingdom presents
        </p>
        <h1 className="font-display text-4xl font-bold text-white md:text-5xl">
          BONSAI VAULT <span className="text-vault-accent">#001</span>
        </h1>
        <p className="mx-auto max-w-lg text-sm text-zinc-400 leading-relaxed">
          4 masterpieces by Masashi Hirao — bundled, valued, and locked in a
          single on-chain vault. Total valuation:{" "}
          <span className="font-mono text-vault-accent">{VAULT_TOTAL_ETH} ETH</span>
        </p>
      </section>

      {/* Bonsai Grid */}
      <section>
        <h2 className="mb-4 text-xs uppercase tracking-[0.2em] text-zinc-500">
          Vault Composition — 4 Bonsai
        </h2>
        <div data-testid="bonsai-grid" className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {VAULT_BONSAI.map((bonsai) => (
            <BonsaiCard key={bonsai.id} bonsai={bonsai} />
          ))}
        </div>
      </section>

      {/* Mint + Info */}
      <section className="grid gap-6 md:grid-cols-2">
        <MintPanel />
        <VaultInfo />
      </section>

      {/* Footer */}
      <footer className="border-t border-vault-border pt-8 pb-12 text-center space-y-2">
        <p className="text-xs text-zinc-600">
          BONSAI VAULT is an experimental product by BONSAI KINGDOM.
        </p>
        <p className="text-xs text-zinc-600">
          Vault NFT holders do not acquire ownership of underlying bonsai assets.
          No yield or dividends are guaranteed.
        </p>
        <p className="text-[10px] text-zinc-700">
          Deployed on Base Sepolia • ERC-1155 • Built for Base Batches
        </p>
      </footer>
    </div>
  );
}

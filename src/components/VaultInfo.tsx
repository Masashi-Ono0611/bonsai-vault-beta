"use client";

import { VAULT_BONSAI, VAULT_TOTAL_ETH, MINT_PRICE_ETH, MAX_SUPPLY } from "@/lib/contracts";

export function VaultInfo() {
  return (
    <div className="rounded-2xl border border-vault-border bg-vault-card p-6 space-y-5">
      <h3 className="font-display text-lg font-bold text-white">Vault Economics</h3>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-zinc-400">Underlying Asset Value</span>
          <span className="font-mono text-vault-accent">{VAULT_TOTAL_ETH} ETH</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-400">Total Raise (if sold out)</span>
          <span className="font-mono text-white">{MINT_PRICE_ETH * MAX_SUPPLY} ETH</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-400">Supply</span>
          <span className="font-mono text-white">{MAX_SUPPLY} NFTs</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-400">Standard</span>
          <span className="font-mono text-zinc-300">ERC-1155</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-400">Network</span>
          <span className="font-mono text-zinc-300">Base Sepolia</span>
        </div>
      </div>

      <div className="border-t border-vault-border pt-4 space-y-3">
        <h4 className="text-sm font-semibold text-zinc-300">Revenue → Buyback & Burn</h4>
        <div className="space-y-1 text-xs text-zinc-500">
          <div className="flex justify-between">
            <span>Rental Revenue</span>
            <span className="text-zinc-300">30% to vault</span>
          </div>
          <div className="flex justify-between">
            <span>Sales Revenue</span>
            <span className="text-zinc-300">80% to vault</span>
          </div>
          <div className="flex justify-between">
            <span>Trading Fees (3%)</span>
            <span className="text-zinc-300">1.5% to vault</span>
          </div>
        </div>
        <p className="text-[10px] text-zinc-600 leading-relaxed">
          Revenue is used to buy vault NFTs from the market and burn them,
          reducing supply and increasing each holder&apos;s proportional value.
        </p>
      </div>

      <div className="border-t border-vault-border pt-4 space-y-3">
        <h4 className="text-sm font-semibold text-zinc-300">Valuation Breakdown</h4>
        {VAULT_BONSAI.map((b) => (
          <div key={b.id} className="flex items-center justify-between text-xs">
            <span className="text-zinc-400">
              {b.nameJa}{" "}
              <span className="text-zinc-600">({b.valuationMethod})</span>
            </span>
            <span className="font-mono text-zinc-300">{b.priceETH} ETH</span>
          </div>
        ))}
        <div className="flex items-center justify-between border-t border-zinc-800 pt-2 text-sm font-semibold">
          <span className="text-zinc-300">Total</span>
          <span className="font-mono text-vault-accent">{VAULT_TOTAL_ETH} ETH</span>
        </div>
      </div>

      <div className="rounded-lg bg-zinc-900 p-3 text-xs text-zinc-500 leading-relaxed">
        <p className="font-semibold text-zinc-400 mb-1">Important Notice</p>
        <p>
          Vault NFT holders do not own the underlying bonsai assets.
          This is an investment into the vault structure, not direct ownership.
          No yield or dividends are guaranteed. 1-year lock period applies.
        </p>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { useVaultInfo, useCurrentSupply, useVaultBalance } from "@/hooks/useVault";
import { useBuybackAndBurn, useContractBalance } from "@/hooks/useAdmin";
import { TxStatus } from "@/components/admin/TxStatus";

export default function BuybackAdmin() {
  const { address } = useAccount();
  const { data: vaultInfo } = useVaultInfo(0);
  const { data: supply } = useCurrentSupply(0);
  const { data: ownerBalance } = useVaultBalance(0, address);
  const { data: ethBal } = useContractBalance();
  const bb = useBuybackAndBurn();
  const [burnAmount, setBurnAmount] = useState("");

  const minted = vaultInfo ? Number(vaultInfo[4]) : 0;
  const burned = vaultInfo ? Number(vaultInfo[5]) : 0;
  const currentSupply = supply ? Number(supply) : 0;
  const ownerHeld = ownerBalance ? Number(ownerBalance) : 0;
  const contractEth = ethBal ? Number(formatEther(ethBal.value)).toFixed(4) : "0";

  const handleBurn = () => {
    const amt = parseInt(burnAmount);
    if (!amt || amt <= 0) return;
    bb.burn(0, amt);
  };

  return (
    <div className="space-y-8" data-testid="admin-buyback">
      <h1 className="text-2xl font-bold text-white">Buyback & Burn</h1>

      {/* Overview */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-vault-border bg-vault-card p-4 text-center">
          <p className="text-xs text-zinc-500">Total Minted</p>
          <p className="mt-1 font-mono text-xl font-bold text-white">{minted}</p>
        </div>
        <div className="rounded-xl border border-vault-border bg-vault-card p-4 text-center">
          <p className="text-xs text-zinc-500">Total Burned</p>
          <p className="mt-1 font-mono text-xl font-bold text-vault-red">{burned}</p>
        </div>
        <div className="rounded-xl border border-vault-border bg-vault-card p-4 text-center">
          <p className="text-xs text-zinc-500">Current Supply</p>
          <p className="mt-1 font-mono text-xl font-bold text-white">{currentSupply}</p>
        </div>
        <div className="rounded-xl border border-vault-border bg-vault-card p-4 text-center">
          <p className="text-xs text-zinc-500">Contract ETH</p>
          <p className="mt-1 font-mono text-xl font-bold text-vault-accent">{contractEth}</p>
        </div>
      </div>

      {/* Burn Visualization */}
      <div className="rounded-xl border border-vault-border bg-vault-card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-zinc-300">Supply Reduction</h3>
        <div className="relative h-8 w-full overflow-hidden rounded-full bg-zinc-800">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-vault-accent/30"
            style={{ width: `${(minted / 1000) * 100}%` }}
          />
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-vault-accent"
            style={{ width: `${(currentSupply / 1000) * 100}%` }}
          />
          {burned > 0 && (
            <div
              className="absolute inset-y-0 rounded-full bg-vault-red/50"
              style={{
                left: `${(currentSupply / 1000) * 100}%`,
                width: `${(burned / 1000) * 100}%`,
              }}
            />
          )}
        </div>
        <div className="flex justify-between text-[10px] text-zinc-500">
          <span>Supply: {currentSupply}</span>
          {burned > 0 && <span className="text-vault-red">Burned: {burned}</span>}
          <span>Max: 1000</span>
        </div>
      </div>

      {/* Burn Action */}
      <div className="rounded-xl border border-vault-border bg-vault-card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-zinc-300">Execute Burn</h3>
        <p className="text-xs text-zinc-500">
          You hold <span className="font-mono text-white">{ownerHeld}</span> Vault NFTs.
          Burning reduces total supply, increasing each remaining holder&apos;s proportional value.
        </p>
        <div className="flex gap-3">
          <input
            type="number"
            min="1"
            max={ownerHeld}
            placeholder="Amount to burn"
            value={burnAmount}
            onChange={(e) => setBurnAmount(e.target.value)}
            className="flex-1 rounded-lg border border-vault-border bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-vault-accent focus:outline-none"
          />
          <button
            onClick={handleBurn}
            disabled={bb.isPending || bb.isConfirming || ownerHeld === 0}
            className="rounded-lg bg-vault-red px-5 py-2 text-sm font-semibold text-white hover:bg-vault-red/80 disabled:opacity-50"
          >
            {bb.isPending ? "Confirm…" : bb.isConfirming ? "Burning…" : "🔥 Burn"}
          </button>
        </div>
        {ownerHeld === 0 && (
          <p className="text-xs text-zinc-500">
            You need to hold Vault NFTs to burn them. Mint or buy from the market first.
          </p>
        )}
        <TxStatus hash={bb.hash} isPending={bb.isPending} isConfirming={bb.isConfirming} isSuccess={bb.isSuccess} error={bb.error} />
      </div>
    </div>
  );
}

"use client";

import { formatEther } from "viem";
import { useVaultInfo, useCurrentSupply } from "@/hooks/useVault";
import { useContractBalance, useBonsaiCount, useWithdrawFunds } from "@/hooks/useAdmin";
import { TxStatus } from "@/components/admin/TxStatus";
import { PUBLIC_SUPPLY, MAX_SUPPLY, VAULT_ADDRESS, REGISTRY_ADDRESS } from "@/lib/contracts";
import { useState } from "react";

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-vault-border bg-vault-card p-4">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 font-mono text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-[10px] text-zinc-500">{sub}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const { data: vaultInfo } = useVaultInfo(0);
  const { data: supply } = useCurrentSupply(0);
  const { data: ethBal } = useContractBalance();
  const { data: bonsaiCount } = useBonsaiCount();
  const { withdraw, hash, isPending, isConfirming, isSuccess, error } = useWithdrawFunds();
  const [withdrawAmt, setWithdrawAmt] = useState("");

  const minted = vaultInfo ? Number(vaultInfo[4]) : 0;
  const burned = vaultInfo ? Number(vaultInfo[5]) : 0;
  const active = vaultInfo ? vaultInfo[7] : false;
  const mintRevenue = vaultInfo ? formatEther(vaultInfo[2] * BigInt(minted)) : "0";
  const contractEth = ethBal ? formatEther(ethBal.value) : "0";

  return (
    <div className="space-y-6" data-testid="admin-dashboard">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${active ? "bg-vault-green/20 text-vault-green" : "bg-vault-red/20 text-vault-red"}`}>
          {active ? "Vault Active" : "Vault Paused"}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Minted" value={`${minted}`} sub={`/ ${PUBLIC_SUPPLY} public`} />
        <StatCard label="Burned" value={`${burned}`} />
        <StatCard label="Current Supply" value={supply ? supply.toString() : "0"} />
        <StatCard label="Bonsai Registered" value={bonsaiCount ? bonsaiCount.toString() : "0"} />
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard label="Mint Revenue" value={`${Number(mintRevenue).toFixed(4)}`} sub="ETH (total)" />
        <StatCard label="Contract Balance" value={`${Number(contractEth).toFixed(4)}`} sub="ETH" />
        <StatCard label="Mint Progress" value={`${((minted / PUBLIC_SUPPLY) * 100).toFixed(1)}%`} />
      </div>

      {/* Contract Addresses */}
      <div className="rounded-xl border border-vault-border bg-vault-card p-4 space-y-2">
        <h3 className="text-sm font-semibold text-zinc-300">Contract Addresses</h3>
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-500">BonsaiVault</span>
          <a href={`https://sepolia.basescan.org/address/${VAULT_ADDRESS}`} target="_blank" rel="noopener noreferrer" className="font-mono text-vault-accent hover:underline">{VAULT_ADDRESS}</a>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-500">BonsaiRegistry</span>
          <a href={`https://sepolia.basescan.org/address/${REGISTRY_ADDRESS}`} target="_blank" rel="noopener noreferrer" className="font-mono text-vault-accent hover:underline">{REGISTRY_ADDRESS}</a>
        </div>
      </div>

      {/* Withdraw */}
      <div className="rounded-xl border border-vault-border bg-vault-card p-4 space-y-3">
        <h3 className="text-sm font-semibold text-zinc-300">Withdraw Funds</h3>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Amount (ETH)"
            value={withdrawAmt}
            onChange={(e) => setWithdrawAmt(e.target.value)}
            className="flex-1 rounded-lg border border-vault-border bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-vault-accent focus:outline-none"
          />
          <button
            onClick={() => {
              if (!withdrawAmt) return;
              const wei = BigInt(Math.floor(parseFloat(withdrawAmt) * 1e18));
              withdraw(wei);
            }}
            disabled={isPending || isConfirming}
            className="rounded-lg bg-vault-accent px-4 py-2 text-sm font-semibold text-vault-bg hover:bg-vault-accent/90 disabled:opacity-50"
          >
            Withdraw
          </button>
        </div>
        <TxStatus hash={hash} isPending={isPending} isConfirming={isConfirming} isSuccess={isSuccess} error={error} />
      </div>
    </div>
  );
}

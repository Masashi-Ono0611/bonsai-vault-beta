"use client";

import { useState } from "react";
import { formatEther, parseEther } from "viem";
import { useReadContract } from "wagmi";
import { useVaultInfo, useCurrentSupply } from "@/hooks/useVault";
import { useCreateVault, useSetVaultActive, useBonsaiCount } from "@/hooks/useAdmin";
import { BonsaiVaultABI } from "@/lib/abi";
import { VAULT_ADDRESS } from "@/lib/contracts";
import { TxStatus } from "@/components/admin/TxStatus";

function VaultRow({ id }: { id: number }) {
  const { data: info } = useVaultInfo(id);
  const { data: supply } = useCurrentSupply(id);
  const toggle = useSetVaultActive();

  if (!info) return null;
  const [name, , mintPrice, maxSupply, minted, burned, createdAt, active] = info;

  return (
    <div className="rounded-xl border border-vault-border bg-vault-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-white">{name}</h3>
          <p className="text-xs text-zinc-500">ID: {id} • Created: {new Date(Number(createdAt) * 1000).toLocaleDateString()}</p>
        </div>
        <button
          onClick={() => toggle.setActive(id, !active)}
          disabled={toggle.isPending || toggle.isConfirming}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            active
              ? "bg-vault-green/20 text-vault-green hover:bg-vault-red/20 hover:text-vault-red"
              : "bg-vault-red/20 text-vault-red hover:bg-vault-green/20 hover:text-vault-green"
          }`}
        >
          {active ? "Active — Click to Pause" : "Paused — Click to Activate"}
        </button>
      </div>
      <div className="grid grid-cols-4 gap-3 text-center text-xs">
        <div className="rounded-lg bg-zinc-900 p-2">
          <p className="text-zinc-500">Price</p>
          <p className="font-mono text-white">{formatEther(mintPrice)} ETH</p>
        </div>
        <div className="rounded-lg bg-zinc-900 p-2">
          <p className="text-zinc-500">Minted</p>
          <p className="font-mono text-white">{Number(minted)} / {Number(maxSupply)}</p>
        </div>
        <div className="rounded-lg bg-zinc-900 p-2">
          <p className="text-zinc-500">Burned</p>
          <p className="font-mono text-white">{Number(burned)}</p>
        </div>
        <div className="rounded-lg bg-zinc-900 p-2">
          <p className="text-zinc-500">Supply</p>
          <p className="font-mono text-white">{supply?.toString() || "0"}</p>
        </div>
      </div>
      {/* Progress */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
        <div className="h-full rounded-full bg-vault-accent" style={{ width: `${(Number(minted) / Number(maxSupply)) * 100}%` }} />
      </div>
      <TxStatus hash={toggle.hash} isPending={toggle.isPending} isConfirming={toggle.isConfirming} isSuccess={toggle.isSuccess} error={toggle.error} />
    </div>
  );
}

export default function VaultsAdmin() {
  const { data: vaultCount } = useReadContract({
    address: VAULT_ADDRESS,
    abi: BonsaiVaultABI,
    functionName: "vaultCount",
  });
  const { data: bonsaiCount } = useBonsaiCount();
  const numVaults = vaultCount ? Number(vaultCount) : 0;
  const numBonsai = bonsaiCount ? Number(bonsaiCount) : 0;

  const cv = useCreateVault();
  const [form, setForm] = useState({ name: "", desc: "", price: "0.05", supply: "1000", bonsaiIds: "" });

  const handleCreate = () => {
    if (!form.name || !form.price || !form.bonsaiIds) return;
    const ids = form.bonsaiIds.split(",").map((s) => BigInt(s.trim()));
    cv.create(form.name, form.desc, parseEther(form.price), BigInt(form.supply), ids);
  };

  return (
    <div className="space-y-8" data-testid="admin-vaults">
      <h1 className="text-2xl font-bold text-white">Vault Management</h1>

      {/* Existing Vaults */}
      <div className="space-y-4">
        {Array.from({ length: numVaults }, (_, i) => (
          <VaultRow key={i} id={i} />
        ))}
        {numVaults === 0 && (
          <div className="rounded-xl border border-vault-border bg-vault-card p-8 text-center text-sm text-zinc-500">
            No vaults created yet
          </div>
        )}
      </div>

      {/* Create Vault Form */}
      <div className="rounded-xl border border-vault-border bg-vault-card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-zinc-300">Create New Vault</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <input placeholder="Vault Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-lg border border-vault-border bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-vault-accent focus:outline-none" />
          <input placeholder="Mint Price (ETH)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="rounded-lg border border-vault-border bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-vault-accent focus:outline-none" />
          <input placeholder="Max Supply" value={form.supply} onChange={(e) => setForm({ ...form, supply: e.target.value })} className="rounded-lg border border-vault-border bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-vault-accent focus:outline-none" />
          <input placeholder={`Bonsai IDs (comma-sep, 0-${numBonsai - 1})`} value={form.bonsaiIds} onChange={(e) => setForm({ ...form, bonsaiIds: e.target.value })} className="rounded-lg border border-vault-border bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-vault-accent focus:outline-none" />
          <textarea placeholder="Description" value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} rows={2} className="md:col-span-2 rounded-lg border border-vault-border bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-vault-accent focus:outline-none resize-none" />
        </div>
        <button onClick={handleCreate} disabled={cv.isPending || cv.isConfirming} className="rounded-lg bg-vault-accent px-5 py-2 text-sm font-semibold text-vault-bg hover:bg-vault-accent/90 disabled:opacity-50">
          {cv.isPending ? "Confirm…" : cv.isConfirming ? "Confirming…" : "Create Vault"}
        </button>
        <TxStatus hash={cv.hash} isPending={cv.isPending} isConfirming={cv.isConfirming} isSuccess={cv.isSuccess} error={cv.error} />
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { formatEther, parseEther } from "viem";
import { useBonsaiCount, useRegisterBonsai, useLogPrice } from "@/hooks/useAdmin";
import { useReadContract } from "wagmi";
import { BonsaiRegistryABI } from "@/lib/abi";
import { REGISTRY_ADDRESS } from "@/lib/contracts";
import { TxStatus } from "@/components/admin/TxStatus";

const VALUATION_METHODS = ["Classic Gallery", "Exchange Gallery", "Secondary Market"];

function BonsaiRow({ id }: { id: number }) {
  const { data } = useReadContract({
    address: REGISTRY_ADDRESS,
    abi: BonsaiRegistryABI,
    functionName: "getBonsai",
    args: [BigInt(id)],
  });
  const { data: price } = useReadContract({
    address: REGISTRY_ADDRESS,
    abi: BonsaiRegistryABI,
    functionName: "getLatestPrice",
    args: [BigInt(id)],
  });

  if (!data) return null;
  const [name, species, artist, imageURI, method, initialPrice, registeredAt, active] = data;

  return (
    <tr className="border-b border-vault-border hover:bg-zinc-900/50">
      <td className="px-3 py-3 font-mono text-xs text-zinc-400">{id}</td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-3">
          {imageURI && (
            <img src={imageURI} alt={name} className="h-10 w-10 rounded-lg object-cover" />
          )}
          <div>
            <p className="text-sm font-medium text-white">{name}</p>
            <p className="text-[11px] text-zinc-500">{species} • {artist}</p>
          </div>
        </div>
      </td>
      <td className="px-3 py-3">
        <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-[10px] text-zinc-400">
          {VALUATION_METHODS[Number(method)] || "Unknown"}
        </span>
      </td>
      <td className="px-3 py-3 text-right font-mono text-sm text-white">
        {price ? Number(formatEther(price)).toFixed(4) : "—"} ETH
      </td>
      <td className="px-3 py-3 text-center">
        <span className={`inline-block h-2 w-2 rounded-full ${active ? "bg-vault-green" : "bg-vault-red"}`} />
      </td>
    </tr>
  );
}

export default function BonsaiAdmin() {
  const { data: count } = useBonsaiCount();
  const bonsaiCount = count ? Number(count) : 0;

  // Register form
  const [form, setForm] = useState({ name: "", species: "", artist: "", imageURI: "", method: 0, price: "" });
  const reg = useRegisterBonsai();

  // Price log form
  const [logForm, setLogForm] = useState({ bonsaiId: "", price: "", source: 0, evidence: "" });
  const pl = useLogPrice();

  const handleRegister = () => {
    if (!form.name || !form.price) return;
    reg.register(form.name, form.species, form.artist, form.imageURI, form.method, parseEther(form.price));
  };

  const handleLogPrice = () => {
    if (!logForm.bonsaiId || !logForm.price) return;
    pl.logPrice(Number(logForm.bonsaiId), parseEther(logForm.price), logForm.source, logForm.evidence);
  };

  return (
    <div className="space-y-8" data-testid="admin-bonsai">
      <h1 className="text-2xl font-bold text-white">Bonsai Management</h1>

      {/* Bonsai Table */}
      <div className="overflow-hidden rounded-xl border border-vault-border">
        <table className="w-full">
          <thead className="bg-vault-card">
            <tr className="text-left text-xs text-zinc-500">
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Bonsai</th>
              <th className="px-3 py-2">Method</th>
              <th className="px-3 py-2 text-right">Latest Price</th>
              <th className="px-3 py-2 text-center">Active</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: bonsaiCount }, (_, i) => (
              <BonsaiRow key={i} id={i} />
            ))}
            {bonsaiCount === 0 && (
              <tr><td colSpan={5} className="px-3 py-8 text-center text-sm text-zinc-500">No bonsai registered yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Register Form */}
      <div className="rounded-xl border border-vault-border bg-vault-card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-zinc-300">Register New Bonsai</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <input placeholder="Name (e.g. 雅趣: Graceful Arc)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-lg border border-vault-border bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-vault-accent focus:outline-none" />
          <input placeholder="Species (e.g. Akamatsu)" value={form.species} onChange={(e) => setForm({ ...form, species: e.target.value })} className="rounded-lg border border-vault-border bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-vault-accent focus:outline-none" />
          <input placeholder="Artist" value={form.artist} onChange={(e) => setForm({ ...form, artist: e.target.value })} className="rounded-lg border border-vault-border bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-vault-accent focus:outline-none" />
          <input placeholder="Image URI" value={form.imageURI} onChange={(e) => setForm({ ...form, imageURI: e.target.value })} className="rounded-lg border border-vault-border bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-vault-accent focus:outline-none" />
          <select value={form.method} onChange={(e) => setForm({ ...form, method: Number(e.target.value) })} className="rounded-lg border border-vault-border bg-zinc-900 px-3 py-2 text-sm text-white focus:border-vault-accent focus:outline-none">
            {VALUATION_METHODS.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <input placeholder="Initial Price (ETH)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="rounded-lg border border-vault-border bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-vault-accent focus:outline-none" />
        </div>
        <button onClick={handleRegister} disabled={reg.isPending || reg.isConfirming} className="rounded-lg bg-vault-accent px-5 py-2 text-sm font-semibold text-vault-bg hover:bg-vault-accent/90 disabled:opacity-50">
          {reg.isPending ? "Confirm…" : reg.isConfirming ? "Confirming…" : "Register Bonsai"}
        </button>
        <TxStatus hash={reg.hash} isPending={reg.isPending} isConfirming={reg.isConfirming} isSuccess={reg.isSuccess} error={reg.error} />
      </div>

      {/* Log Price Form */}
      <div className="rounded-xl border border-vault-border bg-vault-card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-zinc-300">Log Price Update</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <input placeholder="Bonsai ID" value={logForm.bonsaiId} onChange={(e) => setLogForm({ ...logForm, bonsaiId: e.target.value })} className="rounded-lg border border-vault-border bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-vault-accent focus:outline-none" />
          <input placeholder="New Price (ETH)" value={logForm.price} onChange={(e) => setLogForm({ ...logForm, price: e.target.value })} className="rounded-lg border border-vault-border bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-vault-accent focus:outline-none" />
          <select value={logForm.source} onChange={(e) => setLogForm({ ...logForm, source: Number(e.target.value) })} className="rounded-lg border border-vault-border bg-zinc-900 px-3 py-2 text-sm text-white focus:border-vault-accent focus:outline-none">
            {VALUATION_METHODS.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <input placeholder="Evidence URI (optional)" value={logForm.evidence} onChange={(e) => setLogForm({ ...logForm, evidence: e.target.value })} className="rounded-lg border border-vault-border bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-vault-accent focus:outline-none" />
        </div>
        <button onClick={handleLogPrice} disabled={pl.isPending || pl.isConfirming} className="rounded-lg bg-vault-accent px-5 py-2 text-sm font-semibold text-vault-bg hover:bg-vault-accent/90 disabled:opacity-50">
          {pl.isPending ? "Confirm…" : pl.isConfirming ? "Confirming…" : "Log Price"}
        </button>
        <TxStatus hash={pl.hash} isPending={pl.isPending} isConfirming={pl.isConfirming} isSuccess={pl.isSuccess} error={pl.error} />
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import { type BonsaiAsset } from "@/lib/contracts";

const METHOD_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  "Classic Gallery": { bg: "bg-zinc-800/80", text: "text-zinc-300", dot: "bg-amber-400" },
  "Exchange Gallery": { bg: "bg-zinc-800/80", text: "text-zinc-300", dot: "bg-emerald-400" },
  "Secondary Market": { bg: "bg-zinc-800/80", text: "text-zinc-300", dot: "bg-blue-400" },
};

export function BonsaiCard({ bonsai }: { bonsai: BonsaiAsset }) {
  const style = METHOD_STYLES[bonsai.valuationMethod] || { bg: "bg-zinc-800/80", text: "text-zinc-300", dot: "bg-zinc-400" };

  return (
    <div className="group relative overflow-hidden rounded-xl border border-vault-border bg-vault-card transition-all hover:border-vault-accent/40 hover:shadow-lg hover:shadow-vault-accent/5">
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={bonsai.imageURI}
          alt={bonsai.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 25vw"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <p className="font-display text-xl font-bold text-white">
            {bonsai.nameJa}
          </p>
          <p className="text-xs text-zinc-300">{bonsai.name}</p>
        </div>
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-500">{bonsai.species}</span>
          <span className="text-xs text-zinc-500">{bonsai.artist}</span>
        </div>
        <div className="flex items-center justify-between">
          <span
            className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-medium ${style.bg} ${style.text}`}
          >
            <span className={`inline-block h-1.5 w-1.5 rounded-full ${style.dot}`} />
            {bonsai.valuationMethod}
          </span>
          <span className="font-mono text-sm font-semibold text-vault-accent">
            {bonsai.priceETH} ETH
          </span>
        </div>
        <p className="text-[11px] text-zinc-500">{bonsai.valuationDetail}</p>
      </div>
    </div>
  );
}

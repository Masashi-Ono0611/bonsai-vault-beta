"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-vault-border bg-vault-bg/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌳</span>
          <div>
            <h1 className="font-display text-lg font-bold text-vault-accent tracking-wide">
              BONSAI VAULT
            </h1>
            <p className="text-[10px] text-zinc-500 tracking-widest uppercase">
              by Bonsai Kingdom
            </p>
          </div>
        </div>
        <ConnectButton
          showBalance={false}
          chainStatus="icon"
          accountStatus="address"
        />
      </div>
    </header>
  );
}

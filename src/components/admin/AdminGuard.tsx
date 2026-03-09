"use client";

import { useAccount } from "wagmi";
import { useVaultOwner } from "@/hooks/useAdmin";
import { ADMIN_WALLETS } from "@/lib/contracts";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAccount();
  const { data: owner, isLoading } = useVaultOwner();

  if (!isConnected) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center" data-testid="admin-guard-connect">
        <div className="text-center space-y-3">
          <p className="text-4xl">🔒</p>
          <h2 className="text-xl font-bold text-white">Connect Wallet</h2>
          <p className="text-sm text-zinc-400">Connect an authorized wallet to access the admin panel.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-zinc-400 animate-pulse">Loading…</p>
      </div>
    );
  }

  const addr = address?.toLowerCase() ?? "";
  const isOwner = owner ? addr === owner.toLowerCase() : false;
  const isAllowListed = ADMIN_WALLETS.includes(addr);

  if (!isOwner && !isAllowListed) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center" data-testid="admin-guard-denied">
        <div className="text-center space-y-3">
          <p className="text-4xl">⛔</p>
          <h2 className="text-xl font-bold text-white">Access Denied</h2>
          <p className="text-sm text-zinc-400">
            Only authorized wallets can access this panel.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

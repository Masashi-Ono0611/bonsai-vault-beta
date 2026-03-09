"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/bonsai", label: "Bonsai", icon: "🌳" },
  { href: "/admin/vaults", label: "Vaults", icon: "🏦" },
  { href: "/admin/buyback", label: "Buyback & Burn", icon: "🔥" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-vault-border bg-vault-card" data-testid="admin-nav">
      <div className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-4">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm transition-colors ${
                isActive
                  ? "border-vault-accent text-vault-accent"
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
        <div className="ml-auto">
          <Link
            href="/"
            className="text-xs text-zinc-500 hover:text-vault-accent transition-colors"
          >
            ← Back to Mint
          </Link>
        </div>
      </div>
    </nav>
  );
}

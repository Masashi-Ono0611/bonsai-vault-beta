"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useMintVault, useVaultInfo, useCurrentSupply, useVaultBalance, useRedeemableAt } from "@/hooks/useVault";
import { parseEther } from "viem";
import { MINT_PRICE_ETH, MAX_SUPPLY, VAULT_ADDRESS } from "@/lib/contracts";

const BASESCAN_TX = "https://sepolia.basescan.org/tx/";

export function MintPanel() {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState(1);

  const { data: vaultInfo } = useVaultInfo(0);
  const { data: supply } = useCurrentSupply(0);
  const { data: balance } = useVaultBalance(0, address);
  const { data: redeemAt } = useRedeemableAt(0, address);
  const { mint, hash, isPending, isConfirming, isSuccess, error } = useMintVault();

  const minted = vaultInfo ? Number(vaultInfo[4]) : 0;
  const remaining = MAX_SUPPLY - minted;
  const totalCost = (MINT_PRICE_ETH * amount).toFixed(4);
  const holderBalance = balance ? Number(balance) : 0;

  const isContractDeployed = VAULT_ADDRESS !== "0x0000000000000000000000000000000000000000";

  const redeemDate = redeemAt && redeemAt > 0n
    ? new Date(Number(redeemAt) * 1000).toLocaleDateString("ja-JP")
    : null;

  return (
    <div data-testid="mint-panel" className="rounded-2xl border border-vault-border bg-vault-card p-6 space-y-6">
      {/* Vault Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="h-2 w-2 rounded-full bg-vault-green animate-pulse" />
          <span className="text-xs text-vault-green uppercase tracking-wider">Live on Base Sepolia</span>
        </div>
        <h2 className="font-display text-2xl font-bold text-white">
          BONSAI VAULT #001
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Art Bonsai Collection — 4 masterpieces bundled into a single vault
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-zinc-900 p-3 text-center">
          <p className="text-xs text-zinc-500">Mint Price</p>
          <p className="font-mono text-lg font-bold text-white">{MINT_PRICE_ETH}</p>
          <p className="text-[10px] text-zinc-500">ETH</p>
        </div>
        <div className="rounded-lg bg-zinc-900 p-3 text-center">
          <p className="text-xs text-zinc-500">Remaining</p>
          <p className="font-mono text-lg font-bold text-white">
            {isContractDeployed ? remaining : MAX_SUPPLY}
          </p>
          <p className="text-[10px] text-zinc-500">/ {MAX_SUPPLY}</p>
        </div>
        <div className="rounded-lg bg-zinc-900 p-3 text-center">
          <p className="text-xs text-zinc-500">Vault Value</p>
          <p className="font-mono text-lg font-bold text-vault-accent">40.798</p>
          <p className="text-[10px] text-zinc-500">ETH</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="mb-1 flex justify-between text-xs text-zinc-500">
          <span>{minted} minted</span>
          <span>{((minted / MAX_SUPPLY) * 100).toFixed(1)}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-vault-accent-dim to-vault-accent transition-all"
            style={{ width: `${(minted / MAX_SUPPLY) * 100}%` }}
          />
        </div>
      </div>

      {/* Mint Controls */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAmount(Math.max(1, amount - 1))}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-vault-border text-white hover:border-vault-accent transition-colors"
          >
            −
          </button>
          <div className="flex-1 text-center">
            <span className="font-mono text-3xl font-bold text-white">{amount}</span>
          </div>
          <button
            onClick={() => setAmount(Math.min(20, amount + 1))}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-vault-border text-white hover:border-vault-accent transition-colors"
          >
            +
          </button>
        </div>

        <div className="flex justify-between rounded-lg bg-zinc-900 px-4 py-2 text-sm">
          <span className="text-zinc-400">Total</span>
          <span className="font-mono font-semibold text-white">{totalCost} ETH</span>
        </div>

        {!isConnected ? (
          <p className="text-center text-sm text-zinc-500">
            Connect wallet to mint
          </p>
        ) : (
          <button
            onClick={() => mint(0, amount, vaultInfo ? (vaultInfo[2] as bigint) : parseEther("0.05"))}
            disabled={isPending || isConfirming || !isContractDeployed || remaining <= 0}
            className="w-full rounded-xl bg-vault-accent py-3 text-base font-bold text-vault-bg transition-all hover:bg-vault-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending
              ? "Confirm in wallet..."
              : isConfirming
              ? "Confirming..."
              : `MINT ${amount} VAULT NFT${amount > 1 ? "s" : ""}`}
          </button>
        )}

        {/* Tx Status */}
        {isSuccess && hash && (
          <div className="rounded-lg border border-vault-green/30 bg-vault-green/10 p-3 text-center">
            <p className="text-sm text-vault-green font-semibold">Mint successful!</p>
            <a
              href={`${BASESCAN_TX}${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-vault-accent underline"
            >
              View on BaseScan →
            </a>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-vault-red/30 bg-vault-red/10 p-3 space-y-1">
            <p className="text-xs font-semibold text-vault-red">
              {error.message.includes("User rejected") || error.message.includes("User denied")
                ? "Transaction rejected by user"
                : error.message.includes("insufficient funds")
                ? "Insufficient Base Sepolia ETH"
                : error.message.includes("exceeds the balance")
                ? "Insufficient Base Sepolia ETH"
                : "Transaction failed"}
            </p>
            {!error.message.includes("User rejected") && !error.message.includes("User denied") && (
              <p className="text-[10px] text-zinc-500">
                You need Base Sepolia testnet ETH to mint.{" "}
                <a
                  href="https://www.alchemy.com/faucets/base-sepolia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-vault-accent underline"
                >
                  Get free ETH from faucet →
                </a>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Holdings */}
      {holderBalance > 0 && (
        <div className="border-t border-vault-border pt-4 space-y-2">
          <h3 className="text-sm font-semibold text-zinc-300">Your Holdings</h3>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Vault #001 NFTs</span>
            <span className="font-mono text-white">{holderBalance}</span>
          </div>
          {redeemDate && (
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Redeemable after</span>
              <span className="font-mono text-zinc-300">{redeemDate}</span>
            </div>
          )}
        </div>
      )}

      {/* Lock Notice */}
      <p className="text-center text-[10px] text-zinc-600">
        1-year lock period applies. Redeem available at annual settlement.
      </p>
    </div>
  );
}

"use client";

const BASESCAN_TX = "https://sepolia.basescan.org/tx/";

interface TxStatusProps {
  hash?: `0x${string}`;
  isPending: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  error: Error | null;
}

export function TxStatus({ hash, isPending, isConfirming, isSuccess, error }: TxStatusProps) {
  if (isPending) {
    return <p className="text-sm text-yellow-400 animate-pulse">⏳ Confirm in wallet…</p>;
  }
  if (isConfirming) {
    return <p className="text-sm text-blue-400 animate-pulse">⛓ Confirming on-chain…</p>;
  }
  if (isSuccess && hash) {
    return (
      <div className="rounded-lg border border-vault-green/30 bg-vault-green/10 px-3 py-2">
        <p className="text-sm text-vault-green">✓ Transaction confirmed</p>
        <a
          href={`${BASESCAN_TX}${hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-vault-accent underline"
        >
          View on BaseScan →
        </a>
      </div>
    );
  }
  if (error) {
    return (
      <div className="rounded-lg border border-vault-red/30 bg-vault-red/10 px-3 py-2">
        <p className="text-xs text-vault-red">
          {error.message.length > 150 ? error.message.slice(0, 150) + "…" : error.message}
        </p>
      </div>
    );
  }
  return null;
}

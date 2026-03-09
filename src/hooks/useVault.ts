"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { BonsaiVaultABI } from "@/lib/abi";
import { VAULT_ADDRESS } from "@/lib/contracts";

export function useVaultInfo(vaultId: number) {
  return useReadContract({
    address: VAULT_ADDRESS,
    abi: BonsaiVaultABI,
    functionName: "getVaultInfo",
    args: [BigInt(vaultId)],
  });
}

export function useCurrentSupply(vaultId: number) {
  return useReadContract({
    address: VAULT_ADDRESS,
    abi: BonsaiVaultABI,
    functionName: "currentSupply",
    args: [BigInt(vaultId)],
  });
}

export function useVaultBalance(vaultId: number, address: `0x${string}` | undefined) {
  return useReadContract({
    address: VAULT_ADDRESS,
    abi: BonsaiVaultABI,
    functionName: "balanceOf",
    args: address ? [address, BigInt(vaultId)] : undefined,
    query: { enabled: !!address },
  });
}

export function useIsRedeemable(vaultId: number, address: `0x${string}` | undefined) {
  return useReadContract({
    address: VAULT_ADDRESS,
    abi: BonsaiVaultABI,
    functionName: "isRedeemable",
    args: address ? [BigInt(vaultId), address] : undefined,
    query: { enabled: !!address },
  });
}

export function useRedeemableAt(vaultId: number, address: `0x${string}` | undefined) {
  return useReadContract({
    address: VAULT_ADDRESS,
    abi: BonsaiVaultABI,
    functionName: "redeemableAt",
    args: address ? [BigInt(vaultId), address] : undefined,
    query: { enabled: !!address },
  });
}

export function useMintVault() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const mint = (vaultId: number, amount: number, mintPriceWei: bigint) => {
    const value = mintPriceWei * BigInt(amount);
    writeContract({
      chainId: baseSepolia.id,
      address: VAULT_ADDRESS,
      abi: BonsaiVaultABI,
      functionName: "mint",
      args: [BigInt(vaultId), BigInt(amount)],
      value,
      gas: 200_000n,
    });
  };

  return { mint, hash, isPending, isConfirming, isSuccess, error };
}

"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useBalance } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { BonsaiVaultABI, BonsaiRegistryABI } from "@/lib/abi";
import { VAULT_ADDRESS, REGISTRY_ADDRESS } from "@/lib/contracts";

// ─── Vault Owner Check ──────────────────────────────────────
export function useVaultOwner() {
  return useReadContract({
    address: VAULT_ADDRESS,
    abi: BonsaiVaultABI,
    functionName: "owner",
  });
}

// ─── Contract ETH Balance ───────────────────────────────────
export function useContractBalance() {
  return useBalance({ address: VAULT_ADDRESS });
}

// ─── Registry Reads ─────────────────────────────────────────
export function useBonsaiCount() {
  return useReadContract({
    address: REGISTRY_ADDRESS,
    abi: BonsaiRegistryABI,
    functionName: "bonsaiCount",
  });
}

export function useBonsai(bonsaiId: number) {
  return useReadContract({
    address: REGISTRY_ADDRESS,
    abi: BonsaiRegistryABI,
    functionName: "getBonsai",
    args: [BigInt(bonsaiId)],
    query: { enabled: bonsaiId >= 0 },
  });
}

export function useLatestPrice(bonsaiId: number) {
  return useReadContract({
    address: REGISTRY_ADDRESS,
    abi: BonsaiRegistryABI,
    functionName: "getLatestPrice",
    args: [BigInt(bonsaiId)],
  });
}

export function useTotalValuation(bonsaiIds: bigint[]) {
  return useReadContract({
    address: REGISTRY_ADDRESS,
    abi: BonsaiRegistryABI,
    functionName: "getTotalValuation",
    args: [bonsaiIds],
    query: { enabled: bonsaiIds.length > 0 },
  });
}

// ─── Registry Writes ────────────────────────────────────────
export function useRegisterBonsai() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const register = (
    name: string, species: string, artist: string,
    imageURI: string, valuationMethod: number, initialPriceWei: bigint
  ) => {
    writeContract({
      chainId: baseSepolia.id,
      address: REGISTRY_ADDRESS,
      abi: BonsaiRegistryABI,
      functionName: "registerBonsai",
      args: [name, species, artist, imageURI, valuationMethod, initialPriceWei],
    });
  };

  return { register, hash, isPending, isConfirming, isSuccess, error };
}

export function useLogPrice() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const logPrice = (bonsaiId: number, priceWei: bigint, source: number, evidenceURI: string) => {
    writeContract({
      chainId: baseSepolia.id,
      address: REGISTRY_ADDRESS,
      abi: BonsaiRegistryABI,
      functionName: "logPrice",
      args: [BigInt(bonsaiId), priceWei, source, evidenceURI],
    });
  };

  return { logPrice, hash, isPending, isConfirming, isSuccess, error };
}

// ─── Vault Writes ───────────────────────────────────────────
export function useCreateVault() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const create = (
    name: string, description: string,
    mintPrice: bigint, maxSupply: bigint, bonsaiIds: bigint[]
  ) => {
    writeContract({
      chainId: baseSepolia.id,
      address: VAULT_ADDRESS,
      abi: BonsaiVaultABI,
      functionName: "createVault",
      args: [name, description, mintPrice, maxSupply, bonsaiIds],
    });
  };

  return { create, hash, isPending, isConfirming, isSuccess, error };
}

export function useSetVaultActive() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const setActive = (vaultId: number, active: boolean) => {
    writeContract({
      chainId: baseSepolia.id,
      address: VAULT_ADDRESS,
      abi: BonsaiVaultABI,
      functionName: "setVaultActive",
      args: [BigInt(vaultId), active],
    });
  };

  return { setActive, hash, isPending, isConfirming, isSuccess, error };
}

export function useBuybackAndBurn() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const burn = (vaultId: number, amount: number) => {
    writeContract({
      chainId: baseSepolia.id,
      address: VAULT_ADDRESS,
      abi: BonsaiVaultABI,
      functionName: "buybackAndBurn",
      args: [BigInt(vaultId), BigInt(amount)],
    });
  };

  return { burn, hash, isPending, isConfirming, isSuccess, error };
}

export function useWithdrawFunds() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const withdraw = (amountWei: bigint) => {
    writeContract({
      chainId: baseSepolia.id,
      address: VAULT_ADDRESS,
      abi: BonsaiVaultABI,
      functionName: "withdrawFunds",
      args: [amountWei],
    });
  };

  return { withdraw, hash, isPending, isConfirming, isSuccess, error };
}

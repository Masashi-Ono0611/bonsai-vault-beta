import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import { Header } from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "BONSAI VAULT — Art Bonsai Collection",
  description:
    "Mint vault NFTs backed by curated bonsai masterpieces. ERC-1155 on Base.",
  openGraph: {
    title: "BONSAI VAULT #001",
    description:
      "4 masterpieces by Masashi Hirao bundled into a single vault NFT. Mint on Base Sepolia.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-vault-bg font-sans antialiased">
        <Providers>
          <Header />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}

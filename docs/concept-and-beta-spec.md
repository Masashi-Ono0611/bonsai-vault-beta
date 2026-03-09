# BONSAI VAULT Beta - コンセプト & 実装仕様ドラフト

**作成日**: 2026-03-09
**ステータス**: DRAFT

---

## 1. BONSAI VAULTとは

BONSAI VAULTは、**複数の盆栽NFTを束ねた「金庫（Vault）」への投資を可能にするNFTプロダクト**。

### コアコンセプト

- 4つ以上の盆栽NFT（BONSAI NFT GALLERY既存作品）を1つのVaultに組成
- Vault NFT（ERC-1155）を購入者に販売
- **購入者は盆栽の所有権を持たない** — あくまで「盆栽が入っている金庫」への投資
- レンタル収益・販売収益・取引手数料からの**バイバック&バーン**で価値還元

### 前作（bonsai-vault）との違い

| 項目 | 前作（bonsai-vault） | Beta |
|------|---------------------|------|
| コントラクト規格 | ERC-721 / ERC-20 / ERC-1155 混在 | **ERC-1155に統一** |
| 機能範囲 | Registry + Price Log + Share + Lock + Bridge | **Mint + Redeem + Dashboard に集中** |
| 画面構成 | 6ページ（Gallery, Assets, Detail, Curator, Mint, Bridge） | **2画面（Mint / Management）** |
| 複雑さ | V3まで進化した多機能設計 | **シンプル＆明快** |
| 対象ユーザー | Curator中心 | **購入者（Mint）+ 運営（Management）** |

---

## 2. Vault構成と経済設計

### 2.1 Vault NFT基本仕様

| パラメータ | 値 |
|-----------|-----|
| 規格 | ERC-1155 |
| 総供給量 | 1,000 NFT / Vault |
| ミント価格 | 0.05 ETH（約16,000円） |
| 市場規模 | 50 ETH（約1,600万円）/ Vault |
| 最小構成盆栽数 | 4体 |

### 2.2 盆栽評価方法

Vaultに組み入れる盆栽の評価額は、出所に応じて3段階で算出：

| 出所 | 評価方法 | 例 |
|------|---------|-----|
| **古典ギャラリー販売品** | 過去購入金額 × 120% | 購入3万円 → 評価3.6万円 |
| **交換ギャラリー品** | FARM × 3,000円、または二次流通価格 | FARM 10 → 評価3万円 |
| **二次流通品** | 直近流通価格 | 市場価格そのまま |

### 2.3 収益分配構造

Vault NFTの保有者には直接的な配当はないが、以下の収益をVault NFTの**バイバック＆バーン**に充当：

| 収益源 | Vault還元率 |
|--------|-----------|
| レンタル収益 | 30% |
| 盆栽販売収益 | 80% |
| 取引手数料（プラットフォーム3%のうち） | 1.5% |

**バイバック＆バーン**：収益の一部で市場からVault NFTを買い上げ、バーンする。
→ 供給減少により既存保有者の価値が上昇する仕組み。

### 2.4 資金配分（セール時）

| 項目 | 割合 | 金額（50 ETH想定） |
|------|------|-------------------|
| セール収益 | 70% | 35 ETH |
| └ 運営保持 | 20% | 10 ETH |
| └ 盆栽提供者への分配 | 50% | 25 ETH |
| 提供者ロックアップ | 30% | 15 ETH |

- 提供者ロックアップ：**1年ベスティング**
- 提供者は盆栽の評価額に応じた比例配分

### 2.5 リディーム（買い戻し）

- **1年ロック**後に行使可能
- **年1回の総決算時**にETHでの買い取り
- Vault解散時は構成資産の清算価格で分配

---

## 3. Beta版 実装スコープ

### 3.1 画面構成（2画面）

#### 画面1：Mint画面（購入者向け）

**目的**：シンプルにVault NFTをミントできる画面

```
┌─────────────────────────────────────┐
│  BONSAI VAULT                       │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  Vault #001                  │    │
│  │  "Art Bonsai Collection"     │    │
│  │                              │    │
│  │  構成盆栽: 4体               │    │
│  │  ├ Black Pine #12            │    │
│  │  ├ White Pine #08            │    │
│  │  ├ Maple #03                 │    │
│  │  └ Juniper #21               │    │
│  │                              │    │
│  │  Vault評価額: 2.5 ETH        │    │
│  │  ミント価格: 0.05 ETH        │    │
│  │  残り: 847 / 1,000           │    │
│  │                              │    │
│  │  [数量: 1 ▼] [MINT]          │    │
│  └─────────────────────────────┘    │
│                                     │
│  ── あなたの保有 ──                  │
│  Vault #001: 3 NFTs                 │
│  [REDEEM] (ロック中: 残り284日)     │
│                                     │
└─────────────────────────────────────┘
```

**機能**：
- ウォレット接続（RainbowKit）
- Vault情報表示（構成盆栽、評価額、残供給量）
- ミント実行（ETH支払い）
- 保有状況確認
- リディーム状態表示（ロック期間カウントダウン）

#### 画面2：Management画面（運営向け）

**目的**：Vault組成と運営管理

**機能**：
- Vault作成（名前、構成盆栽の選択、価格設定）
- 盆栽NFTの登録・評価額設定
- 価格ログの記録
- バイバック＆バーン実行
- セール状況ダッシュボード（ミント数、売上、保有者数）
- リディーム処理

### 3.2 スマートコントラクト構成

前作の8コントラクトから**3コントラクト**に簡素化：

#### Contract 1: `BonsaiVault.sol`（ERC-1155）

Vault NFTの発行・管理を担う中核コントラクト。

```solidity
// 主要機能
- mint(vaultId, amount)          // Vault NFTのミント（ETH支払い）
- redeem(vaultId, amount)        // リディーム（ロック期間経過後）
- buybackAndBurn(vaultId)        // バイバック＆バーン実行（運営のみ）

// Vault管理
- createVault(name, price, maxSupply, bonsaiIds[])  // Vault作成
- setVaultStatus(vaultId, status)                    // ステータス変更
- withdrawFunds(vaultId)                              // 資金引き出し

// 情報取得
- getVaultInfo(vaultId)          // Vault情報
- getMintedCount(vaultId)        // ミント済み数
- getRedeemableAt(vaultId, holder) // リディーム可能日時
```

#### Contract 2: `BonsaiRegistry.sol`

盆栽資産の登録と評価ログ。

```solidity
// 資産管理
- registerBonsai(name, species, artist, imageURI, valuationMethod, initialPrice)
- updateValuation(bonsaiId, newPrice, source, evidenceURI)

// 情報取得
- getBonsai(bonsaiId)
- getPriceHistory(bonsaiId)
- getLatestPrice(bonsaiId)
```

#### Contract 3: `MockUSDC.sol`（テスト用）

テストネット用のモック安定通貨（必要に応じて）。

### 3.3 テクノロジースタック

| レイヤー | 技術 |
|---------|------|
| フロントエンド | Next.js (App Router), React, TypeScript |
| スタイリング | Tailwind CSS |
| Web3接続 | Wagmi, Viem |
| ウォレット | RainbowKit |
| スマートコントラクト | Solidity 0.8.x, OpenZeppelin |
| 開発環境 | Hardhat |
| テストネット | Base Sepolia |
| デプロイ | Vercel（フロントエンド）、Hardhat（コントラクト） |

---

## 4. 前作から引き継ぐもの / 捨てるもの

### 引き継ぐ

- **盆栽データ構造**（species, artist, age, size等のメタデータ）
- **価格ログの概念**（source, evidenceURI, timestamp）
- **RainbowKit + Wagmi のWeb3接続パターン**
- **Base Sepolia でのデプロイフロー**
- **ダークテーマのUIトーン**

### 捨てる

- VaultRegistryV3の複雑なロール管理（ADMIN/CURATOR/ORACLE/BRIDGE）→ **Owner + 簡易権限で十分**
- ERC-721 BonsaiNFT → **盆栽はRegistryに記録するだけ、NFTとして発行しない**
- GalleryVaultToken（ERC-20シェア）→ **ERC-1155のVault NFTに統合**
- VaultShareToken（ERC-1155シェア配分）→ **不要、ミント販売で代替**
- NFTVaultLock → **不要、Vault内の盆栽は運営管理**
- WrappedGalleryNFT / Bridge → **Beta範囲外**
- Curatorパネル → **Management画面に統合**

---

## 5. デモ優先事項

アートフェア東京向けデモとして以下を優先：

### Phase 1（最優先 - デモ用）

1. **Mint画面**
   - Vault情報表示（構成盆栽、評価額、残数）
   - ウォレット接続
   - ミント実行フロー
   - トランザクション確認UI

2. **BonsaiVaultコントラクト**
   - createVault / mint / getVaultInfo
   - Base Sepoliaデプロイ

### Phase 2（Beta完成）

3. **Management画面**
   - Vault作成フォーム
   - 盆栽登録・評価設定
   - セールダッシュボード

4. **BonsaiRegistryコントラクト**
   - 盆栽登録・価格ログ

5. **リディーム機能**
   - ロック期間管理
   - ETHでの買い戻し処理

6. **バイバック＆バーン**
   - 運営によるバーン実行
   - バーン履歴表示

---

## 6. 法的・設計上の注意点

### やること
- 「投資」ではなく「Vault NFTの購入」として設計
- 盆栽の所有権はVault NFT保有者に帰属しないことを明示
- バイバック＆バーンは「約束」ではなく「運営判断」として実施
- リディームは「権利」ではなく「機能」として説明

### やらないこと
- 利回りの約束
- 配当の保証
- 投資勧誘的な表現
- 証券性を想起させるマーケティング

---

## 7. 将来の拡張（Beta後）

- 複数Vault展開（テーマ別：若木成長、受賞盆栽、海外需要等）
- 価格指数構築 → BIT接続
- オークション連携（Base決済）
- 盆栽NFT GALLERYとの正式連携（メタデータ拡張）
- ERC-4626化（DeFi統合）
- クロスチェーンブリッジ

---

## Appendix A: Vault経済モデルの具体例

### 例：Art Bonsai Vault #001

**構成盆栽（4体）**：

| 盆栽 | 出所 | 評価方法 | 評価額 |
|------|------|---------|--------|
| Black Pine #12 | 古典ギャラリー | 購入額30,000円 × 120% | 36,000円（≈ 0.112 ETH） |
| White Pine #08 | 交換ギャラリー | FARM 50 × 3,000円 | 150,000円（≈ 0.47 ETH） |
| Maple #03 | 二次流通 | 直近流通価格 | 80,000円（≈ 0.25 ETH） |
| Juniper #21 | 古典ギャラリー | 購入額500,000円 × 120% | 600,000円（≈ 1.875 ETH） |

**Vault総評価額**：866,000円（≈ 2.7 ETH）

**NFTセール**：
- 1,000 NFT × 0.05 ETH = 50 ETH
- セール収益（70%）= 35 ETH
  - 運営保持（20%）= 10 ETH
  - 盆栽提供者分配（50%）= 25 ETH
- 提供者ロックアップ（30%）= 15 ETH

**年間運用想定**：
- レンタル収益 100万円/年 → Vault還元30% = 30万円 → バイバック原資
- 仮にVault NFT市場価格が0.05 ETHのまま → 約30枚をバイバック＆バーン
- 供給: 1,000 → 970 → 保有者の持分比率上昇

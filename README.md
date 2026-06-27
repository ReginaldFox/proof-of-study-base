# ProofOfStudyLearning

ProofOfStudyLearning is a learning check-in, onchain learning proof, and education productivity mini app built for Base.

A user connects a wallet, checks in once per UTC day, and immediately sees reward progress backed by a public, verifiable learning record.

Repository: https://github.com/ReginaldFox/proof-of-study-base.git

## Overview

The app is designed as a mobile-first learning companion for the Base App browser.

It provides a simple daily study action, tracks each wallet's learning progress, and displays recent activity and achievement progress in a warm card-based interface.

The current configured contract is deployed on Base Mainnet.

## Features

- Mobile-first English interface for the Base App browser.
- Warm card-based layout with one primary reward action.
- Wallet connection using Wagmi native configuration.
- Supports injected wallets and Coinbase Wallet.
- Supports the Base App injected wallet.
- Supports Coinbase Wallet, MetaMask, OKX Wallet, and other injected EIP-1193 wallets.
- Does not use WalletConnect.
- Does not use RainbowKit.
- Allows one daily onchain study check-in per wallet.
- Tracks personal reward stats.
- Includes wallet lookup.
- Includes an achievement track.
- Shows recent activity.
- Includes Base offchain attribution metadata in `app/layout.tsx`.
- Includes ERC-8021 onchain attribution data suffix in `lib/wagmi.ts` and the `writeContract` call.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Wagmi
- Viem
- Solidity
- Hardhat

## Requirements

Install Node.js and npm before running the project locally.

You will also need access to the configured Base network RPC endpoints when deploying contracts.

## Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env.local
```

Set the following values in `.env.local`:

```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0xcfc974d8A75E8bEC5B3184d29ca4973Ee0aBE96f
NEXT_PUBLIC_CHAIN_ID=8453
```

`8453` is Base Mainnet.

The address above is the configured ProofOfStudy contract on Base Mainnet.

## Base Attribution Configuration

For Base attribution, add the verified app identifier directly in `app/layout.tsx`:

```tsx
<meta name="base:app_id" content="..." />
```

Add the builder code data suffix in `lib/wagmi.ts`:

```ts
export const baseBuilderDataSuffix = '0x62635f3238743235676b380b0080218021802180218021802180218021' as Hex;
```

Current builder code:

```text
bc_28t25gk8
```

## Run Locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local development URL shown in your terminal.

## Build

Create a production build:

```bash
npm run build
```

## Deploy the Contract

Set the deployment variables:

```bash
PRIVATE_KEY=your_deployer_private_key
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
```

Deploy the contract:

```bash

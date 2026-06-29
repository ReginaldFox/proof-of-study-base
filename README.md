# ProofOfStudyLearning

ProofOfStudyLearning is a learning check-in, onchain learning proof, and education productivity mini app built for Base.

It lets a user connect a wallet, complete one study check-in per UTC day, and view reward progress supported by a public, verifiable learning record.

Repository: https://github.com/ReginaldFox/proof-of-study-base.git

## Overview

ProofOfStudyLearning is designed as a mobile-first learning companion for the Base App browser.

The app focuses on a simple daily study action.

Each wallet can check in once per UTC day.

The interface tracks learning progress, recent activity, and achievement progress.

The experience uses a warm, card-based layout with one clear primary action.

The currently configured contract is deployed on Base Mainnet.

## Features

- Mobile-first English interface for the Base App browser.
- Warm card-based layout built around a single daily reward action.
- Wallet connection using a native Wagmi configuration.
- Support for injected wallets.
- Support for Coinbase Wallet.
- Support for the Base App injected wallet.
- Support for MetaMask, OKX Wallet, and other injected EIP-1193 wallets.
- No WalletConnect dependency.
- No RainbowKit dependency.
- One daily onchain study check-in per wallet.
- Personal reward statistics.
- Wallet lookup.
- Achievement progress tracking.
- Recent activity display.
- Base offchain attribution metadata in `app/layout.tsx`.
- ERC-8021 onchain attribution data suffix in `lib/wagmi.ts` and the `writeContract` call.

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

Access to the configured Base network RPC endpoints is required when deploying contracts.

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
npm run deploy:contract
```

After deployment, copy the deployed contract address into `NEXT_PUBLIC_CONTRACT_ADDRESS`.

Make sure `NEXT_PUBLIC_CHAIN_ID` matches the network where the contract is deployed.

## Deploy the Frontend

Push the repository to GitHub.

Import the project into Vercel.

Set the following environment variables in the Vercel project settings:

```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0xcfc974d8A75E8bEC5B3184d29ca4973Ee0aBE96f
NEXT_PUBLIC_CHAIN_ID=8453
```

Use the following build command:

```bash
npm run build
```

Deploy the project after the environment values have been saved.

## Contract Summary

The main contract is located at:

```text
contracts/ProofOfStudy.sol
```

`ProofOfStudy.sol` stores each wallet's learning progress, including:

- Total check-ins
- Current streak
- Longest streak
- Last check-in day

The `checkIn()` function accepts one check-in per UTC day.

When a study check-in succeeds, the contract emits `StudyCheckedIn`.

## Project Structure

Key files and directories include:

```text
app/
contracts/
docs/
lib/
```

The `app` directory contains the Next.js App Router frontend.

The `contracts` directory contains the Solidity contract.

The `lib` directory contains shared client configuration, including Wagmi setup.

The `docs` directory contains supporting documentation for deployment, product behavior, wallets, security, and Base App usage.

## Documentation

Additional project documentation is available in the `docs` directory:

- `docs/attribution.md`
- `docs/wallets.md`
- `docs/deployment.md`
- `docs/qa-checklist.md`
- `docs/mobile.md`
- `docs/base-app.md`
- `docs/security.md`
- `docs/contract.md`
- `docs/product.md`

## Usage Notes

The app is intended to keep the learning action simple and easy to complete from a mobile device.

Daily check-ins are based on UTC days.

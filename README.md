# ProofOfStudy

ProofOfStudy is a learning check-in, onchain learning proof, and education productivity mini app on Base. A user connects a wallet, checks in once per UTC day, and immediately sees reward progress backed by a public, verifiable learning record.

## Features

- Mobile-first English interface for the Base App browser.
- Warm card-based layout with one primary reward action.
- Wagmi native configuration with only injected wallets and Coinbase Wallet.
- Supports Base App injected wallet, Coinbase Wallet, MetaMask, OKX Wallet, and other injected EIP-1193 wallets.
- No WalletConnect project ID and no RainbowKit.
- One daily onchain study check-in per wallet.
- Personal reward stats, wallet lookup, achievement track, and recent activity.
- Base offchain attribution meta tag placeholder in `app/layout.tsx`.
- ERC-8021 onchain attribution data suffix placeholder in `lib/wagmi.ts` and the `writeContract` call.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Wagmi
- Viem
- Solidity
- Hardhat

## Configure

Copy `.env.example` to `.env.local` and set:

```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0xcfc974d8A75E8bEC5B3184d29ca4973Ee0aBE96f
NEXT_PUBLIC_CHAIN_ID=8453
```

`8453` is Base Mainnet. The configured contract is deployed on Base Mainnet.

For base.dev attribution:

- Put the verified app token directly in `app/layout.tsx`:
  `<meta name="base:app_id" content="..." />`
- Put the builder code data suffix in `lib/wagmi.ts`:
  `export const baseBuilderDataSuffix = '0x...' as Hex;`

## Run Locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy Contract

Set deployment variables:

```bash
PRIVATE_KEY=your_deployer_private_key
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
```

Deploy:

```bash
npm run deploy:contract
```

Copy the deployed contract address into `NEXT_PUBLIC_CONTRACT_ADDRESS`.

## Deploy Frontend

Push the repository to GitHub, import it into Vercel, and set:

```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0xcfc974d8A75E8bEC5B3184d29ca4973Ee0aBE96f
NEXT_PUBLIC_CHAIN_ID=8453
```

Build command: `npm run build`.

## Contract Summary

`contracts/ProofOfStudy.sol` stores each wallet's total check-ins, current streak, longest streak, and last check-in day. The `checkIn()` function accepts one check-in per UTC day and emits `StudyCheckedIn`.

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

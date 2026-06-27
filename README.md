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

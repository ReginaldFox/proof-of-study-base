# Wallet Support

The wallet stack intentionally uses Wagmi native connectors only.

- Base App injected wallet uses `injected()`.
- MetaMask, OKX, Rabby, Brave, and similar browser extensions use `injected()`.
- Coinbase Wallet uses `coinbaseWallet()`.
- WalletConnect is not configured.
- RainbowKit is not used.

The Browser Wallet option opens a second picker so users can choose the browser extension they want.

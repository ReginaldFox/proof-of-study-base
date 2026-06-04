# Base Attribution

The mini app uses Base offchain and onchain attribution.

- Offchain app id: `6a1fe0664a7867dea5dcf4f9`
- Builder code: `bc_28t25gk8`
- Encoded data suffix: `0x62635f3238743235676b380b0080218021802180218021802180218021`

The app id is hardcoded in `app/layout.tsx`.
The data suffix is configured in `lib/wagmi.ts` and passed explicitly to `writeContract`.

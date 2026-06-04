import { QueryClient } from '@tanstack/react-query';
import { coinbaseWallet, injected } from 'wagmi/connectors';
import { createConfig, http } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import type { Hex } from 'viem';

const configuredChainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || baseSepolia.id);

export const activeChain = configuredChainId === base.id ? base : baseSepolia;
export const baseBuilderCode = 'bc_28t25gk8';
export const baseBuilderDataSuffix =
  '0x62635f3238743235676b380b0080218021802180218021802180218021' as Hex;

export const wagmiConfig = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    injected(),
    coinbaseWallet({
      appName: 'ProofOfStudy',
      preference: 'eoaOnly'
    })
  ],
  multiInjectedProviderDiscovery: true,
  ssr: false,
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http()
  },
  dataSuffix: baseBuilderDataSuffix
});

export const queryClient = new QueryClient();

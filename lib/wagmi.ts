import { QueryClient } from '@tanstack/react-query';
import { coinbaseWallet, injected } from 'wagmi/connectors';
import { createConfig, http } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import type { Hex } from 'viem';

const configuredChainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || baseSepolia.id);

export const activeChain = configuredChainId === base.id ? base : baseSepolia;
export const baseBuilderDataSuffix = '' as Hex;

export const wagmiConfig = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    injected(),
    coinbaseWallet({
      appName: 'ProofOfStudy',
      preference: 'all'
    })
  ],
  multiInjectedProviderDiscovery: true,
  ssr: true,
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http()
  },
  dataSuffix: baseBuilderDataSuffix || undefined
});

export const queryClient = new QueryClient();

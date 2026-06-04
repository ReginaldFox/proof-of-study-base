'use client';

import {
  Award,
  BookOpenCheck,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Gift,
  GraduationCap,
  Loader2,
  LogOut,
  Search,
  ShieldCheck,
  Sparkles,
  Wallet,
  X
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { type Address, BaseError, type EIP1193Provider, formatUnits, isAddress, zeroAddress } from 'viem';
import {
  type Connector,
  useAccount,
  useChainId,
  useConnect,
  useDisconnect,
  usePublicClient,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract
} from 'wagmi';
import { injected } from 'wagmi/connectors';
import { baseBuilderCode, baseBuilderDataSuffix, activeChain, wagmiConfig } from '@/lib/wagmi';
import { contractAddress, proofOfStudyAbi } from '@/lib/contract';

type StudyProfile = {
  totalCheckIns: bigint;
  currentStreak: bigint;
  longestStreak: bigint;
  lastCheckInDay: bigint;
};

type RecentCheckIn = {
  user: Address;
  day: bigint;
  totalCheckIns: bigint;
  currentStreak: bigint;
};

type BrowserProvider = EIP1193Provider & {
  isBraveWallet?: true;
  isCoinbaseWallet?: true;
  isMetaMask?: true;
  isOkxWallet?: true;
  isOKExWallet?: true;
  isRabby?: true;
  providers?: BrowserProvider[];
};

type BrowserWindow = Window & {
  ethereum?: BrowserProvider;
};

const hasContract = contractAddress !== zeroAddress;
const baseAutoConnectDismissedKey = 'proof-of-study-base-auto-connect-dismissed';

const emptyProfile: StudyProfile = {
  totalCheckIns: 0n,
  currentStreak: 0n,
  longestStreak: 0n,
  lastCheckInDay: 0n
};

const rewards = [
  { name: 'First Spark', target: 1, metric: 'total', note: 'Instant reward after your first check-in.' },
  { name: '7-Day Learner', target: 7, metric: 'total', note: 'Build a visible weekly rhythm.' },
  { name: '14-Day Builder', target: 14, metric: 'streak', note: 'Keep your streak alive for two weeks.' },
  { name: '30-Day Study Hero', target: 30, metric: 'total', note: 'Create a durable learning record.' }
] as const;

function formatAddress(address?: string) {
  if (!address) return 'Not connected';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatDay(day: bigint) {
  if (day === 0n) return 'No check-ins yet';
  const date = new Date(Number(day) * 24 * 60 * 60 * 1000);
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(date);
}

function transactionUrl(hash: string) {
  return `https://basescan.org/tx/${hash}`;
}

function contractUrl(address: Address) {
  return `https://basescan.org/address/${address}`;
}

function currentUtcDay() {
  return Math.floor(Date.now() / 86_400_000).toString();
}

function normalizeError(error?: Error | null) {
  if (!error) return '';
  if (error instanceof BaseError) {
    const shortMessage = error.shortMessage.toLowerCase();
    if (shortMessage.includes('provider not found')) return 'This wallet is not available in the current browser.';
    if (shortMessage.includes('user rejected')) return 'Transaction rejected.';
    if (shortMessage.includes('already checked in')) return 'This wallet already checked in today.';
    return error.shortMessage;
  }
  return error.message;
}

function connectorLabel(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes('coinbase')) return 'Coinbase Wallet';
  if (lower.includes('okx')) return 'OKX Wallet';
  if (lower.includes('meta')) return 'MetaMask';
  if (lower.includes('injected')) return 'Browser Wallet';
  return name;
}

function isCoinbaseConnector(connector: Connector) {
  return connector.name.toLowerCase().includes('coinbase');
}

function isGenericInjectedConnector(connector: Connector) {
  const name = connector.name.toLowerCase();
  return connector.id === 'injected' || name.includes('browser') || name.includes('injected');
}

function legacyProviderName(provider: BrowserProvider, index: number) {
  if (provider.isCoinbaseWallet) return 'Coinbase Wallet Extension';
  if (provider.isOkxWallet || provider.isOKExWallet) return 'OKX Wallet';
  if (provider.isRabby) return 'Rabby Wallet';
  if (provider.isBraveWallet) return 'Brave Wallet';
  if (provider.isMetaMask) return 'MetaMask';
  return index === 0 ? 'Browser Wallet' : `Browser Wallet ${index + 1}`;
}

function getLegacyBrowserConnectors(existingLabels: Set<string>) {
  if (typeof window === 'undefined') return [];

  const ethereum = (window as BrowserWindow).ethereum;
  const providers: BrowserProvider[] = ethereum?.providers?.length ? ethereum.providers : ethereum ? [ethereum] : [];
  const seenProviders = new Set<BrowserProvider>();
  const legacyConnectors: Connector[] = [];

  providers.forEach((provider, index) => {
    if (seenProviders.has(provider)) return;
    seenProviders.add(provider);

    const name = legacyProviderName(provider, index);
    const label = connectorLabel(name);
    if (existingLabels.has(label)) return;
    existingLabels.add(label);

    legacyConnectors.push(
      wagmiConfig._internal.connectors.setup(
        injected({
          target: {
            id: `legacy-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
            name,
            provider
          }
        })
      )
    );
  });

  return legacyConnectors;
}

function StatCard({
  label,
  value,
  icon: Icon
}: {
  label: string;
  value: string;
  icon: typeof BookOpenCheck;
}) {
  return (
    <div className="rounded-lg border border-orange-100 bg-white p-4 shadow-soft">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-orange-50 text-orange-600">
          <Icon size={20} />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-stone-500">{label}</p>
          <p className="mt-1 break-words text-2xl font-semibold text-ink">{value}</p>
        </div>
      </div>
    </div>
  );
}

function ProfileStats({ profile }: { profile: StudyProfile }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Total study days" value={profile.totalCheckIns.toString()} icon={BookOpenCheck} />
      <StatCard label="Current streak" value={profile.currentStreak.toString()} icon={CalendarCheck} />
      <StatCard label="Longest streak" value={profile.longestStreak.toString()} icon={Award} />
      <StatCard label="Last check-in" value={formatDay(profile.lastCheckInDay)} icon={Clock} />
    </div>
  );
}

function WalletDialog({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { connectors, connect, isPending, error, variables } = useConnect();
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [walletView, setWalletView] = useState<'main' | 'browser'>('main');

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setWalletView('main');
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const seenMainLabels = new Set<string>();
  const coinbaseOptions = connectors.filter((connector) => {
    const label = connectorLabel(connector.name);
    if (!isCoinbaseConnector(connector) || seenMainLabels.has(label)) return false;
    seenMainLabels.add(label);
    return true;
  });
  const genericInjectedConnector = connectors.find(isGenericInjectedConnector);
  const browserLabels = new Set<string>();
  const browserWalletOptions = [
    ...connectors.filter((connector) => {
      if (isCoinbaseConnector(connector) || isGenericInjectedConnector(connector)) return false;
      const label = connectorLabel(connector.name);
      if (browserLabels.has(label)) return false;
      browserLabels.add(label);
      return true;
    }),
    ...getLegacyBrowserConnectors(browserLabels)
  ];

  if (browserWalletOptions.length === 0 && genericInjectedConnector) {
    browserWalletOptions.push(genericInjectedConnector);
  }

  function handleConnect(connector: Connector) {
    window.localStorage.removeItem(baseAutoConnectDismissedKey);
    connect({ connector }, { onSuccess: onClose });
  }

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end bg-black/35 px-4 pb-4 sm:items-center sm:justify-center sm:p-6"
      onClick={() => {
        setWalletView('main');
        onClose();
      }}
      role="dialog"
    >
      <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-soft" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-orange-600">Wallet</p>
            <h2 className="mt-1 text-xl font-semibold text-ink">
              {walletView === 'main' ? 'Choose a wallet' : 'Choose a browser wallet'}
            </h2>
          </div>
          <button
            aria-label="Close wallet dialog"
            className="grid h-10 w-10 place-items-center rounded-lg border border-stone-200 text-stone-600"
            onClick={() => {
              setWalletView('main');
              onClose();
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {walletView === 'main' ? (
            <>
              {coinbaseOptions.map((connector) => (
                <button
                  className="flex min-h-14 w-full items-center justify-between gap-3 rounded-lg border border-stone-200 px-4 text-left font-semibold text-ink transition hover:border-orange-300 hover:bg-orange-50 disabled:opacity-60"
                  disabled={isPending}
                  key={connector.uid}
                  onClick={() => handleConnect(connector)}
                >
                  <span>{connectorLabel(connector.name)}</span>
                  {isPending && variables?.connector?.name === connector.name ? (
                    <Loader2 className="animate-spin text-orange-600" size={18} />
                  ) : (
                    <Wallet className="text-orange-600" size={18} />
                  )}
                </button>
              ))}
              <button
                className="flex min-h-14 w-full items-center justify-between gap-3 rounded-lg border border-stone-200 px-4 text-left font-semibold text-ink transition hover:border-orange-300 hover:bg-orange-50 disabled:opacity-60"
                disabled={isPending}
                onClick={() => setWalletView('browser')}
              >
                <span>Browser Wallet</span>
                <Wallet className="text-orange-600" size={18} />
              </button>
            </>
          ) : (
            <>
              <button
                className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-stone-100 px-4 font-semibold text-stone-700"
                onClick={() => setWalletView('main')}
              >
                Back
              </button>
              {browserWalletOptions.map((connector) => (
                <button
                  className="flex min-h-14 w-full items-center justify-between gap-3 rounded-lg border border-stone-200 px-4 text-left font-semibold text-ink transition hover:border-orange-300 hover:bg-orange-50 disabled:opacity-60"
                  disabled={isPending}
                  key={connector.uid}
                  onClick={() => handleConnect(connector)}
                >
                  <span>{connectorLabel(connector.name)}</span>
                  {isPending && variables?.connector?.name === connector.name ? (
                    <Loader2 className="animate-spin text-orange-600" size={18} />
                  ) : (
                    <Wallet className="text-orange-600" size={18} />
                  )}
                </button>
              ))}
              {browserWalletOptions.length === 0 && (
                <p className="rounded-lg bg-orange-50 p-3 text-sm text-stone-600">
                  No browser wallet extension was detected.
                </p>
              )}
            </>
          )}
        </div>

        {isConnected && (
          <button
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-stone-100 px-4 font-semibold text-stone-700"
            onClick={() => {
              window.localStorage.setItem(baseAutoConnectDismissedKey, 'true');
              disconnect();
              setWalletView('main');
              onClose();
            }}
          >
            <LogOut size={18} />
            Disconnect
          </button>
        )}

        {error && <p className="mt-4 text-sm font-medium text-red-600">{normalizeError(error)}</p>}
      </div>
    </div>
  );
}

export function StudyApp() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { connectors, connect } = useConnect();
  const { switchChain, isPending: isSwitchingNetwork } = useSwitchChain();
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [lookupAddress, setLookupAddress] = useState('');
  const [submittedLookup, setSubmittedLookup] = useState<Address | null>(null);
  const [recentCheckIns, setRecentCheckIns] = useState<RecentCheckIn[]>([]);
  const [eventError, setEventError] = useState('');

  const isWrongNetwork = isConnected && chainId !== activeChain.id;
  const lookupIsValid = lookupAddress.trim() === '' || isAddress(lookupAddress.trim());

  const {
    data: myProfileData,
    refetch: refetchMyProfile,
    isLoading: isMyProfileLoading
  } = useReadContract({
    address: contractAddress,
    abi: proofOfStudyAbi,
    functionName: 'getProfile',
    args: address ? [address] : undefined,
    query: {
      enabled: hasContract && Boolean(address) && !isWrongNetwork
    }
  });

  const { data: hasCheckedInToday, refetch: refetchCheckedInToday } = useReadContract({
    address: contractAddress,
    abi: proofOfStudyAbi,
    functionName: 'hasCheckedInToday',
    args: address ? [address] : undefined,
    query: {
      enabled: hasContract && Boolean(address) && !isWrongNetwork
    }
  });

  const { data: totalUsers } = useReadContract({
    address: contractAddress,
    abi: proofOfStudyAbi,
    functionName: 'totalUsers',
    query: {
      enabled: hasContract && !isWrongNetwork
    }
  });

  const {
    data: lookupProfileData,
    refetch: refetchLookupProfile,
    isFetching: isLookupLoading
  } = useReadContract({
    address: contractAddress,
    abi: proofOfStudyAbi,
    functionName: 'getProfile',
    args: submittedLookup ? [submittedLookup] : undefined,
    query: {
      enabled: hasContract && Boolean(submittedLookup) && !isWrongNetwork
    }
  });

  const { data: lookupCheckedInToday, refetch: refetchLookupStatus } = useReadContract({
    address: contractAddress,
    abi: proofOfStudyAbi,
    functionName: 'hasCheckedInToday',
    args: submittedLookup ? [submittedLookup] : undefined,
    query: {
      enabled: hasContract && Boolean(submittedLookup) && !isWrongNetwork
    }
  });

  const {
    writeContract,
    data: transactionHash,
    error: writeError,
    isPending: isWritePending
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError
  } = useWaitForTransactionReceipt({
    hash: transactionHash
  });

  const myProfile = (myProfileData as StudyProfile | undefined) || emptyProfile;
  const lookupProfile = (lookupProfileData as StudyProfile | undefined) || emptyProfile;
  const txError = normalizeError(writeError || receiptError);

  const checkInButtonLabel = useMemo(() => {
    if (!isConnected) return 'Connect Wallet';
    if (isWrongNetwork) return `Switch to ${activeChain.name}`;
    if (hasCheckedInToday) return 'Reward Claimed Today';
    if (isWritePending || isConfirming) return 'Claiming Reward...';
    return 'Claim Today\'s Reward';
  }, [hasCheckedInToday, isConnected, isConfirming, isWritePending, isWrongNetwork]);

  useEffect(() => {
    if (isConnected) return;
    if (typeof window === 'undefined') return;
    if (window.localStorage.getItem(baseAutoConnectDismissedKey) === 'true') return;

    if (!window.ethereum) return;

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isBaseApp = userAgent.includes('base');
    if (!isBaseApp) return;

    const injectedConnector =
      connectors.find((connector) => connector.name.toLowerCase().includes('browser')) ||
      connectors.find((connector) => connector.id === 'injected');

    if (injectedConnector) {
      connect({ connector: injectedConnector });
    }
  }, [connect, connectors, isConnected]);

  useEffect(() => {
    if (!isConfirmed) return;
    refetchMyProfile();
    refetchCheckedInToday();
  }, [isConfirmed, refetchCheckedInToday, refetchMyProfile]);

  useEffect(() => {
    async function loadEvents() {
      if (!publicClient || !hasContract || isWrongNetwork) return;
      setEventError('');

      try {
        const latestBlock = await publicClient.getBlockNumber();
        const fromBlock = latestBlock > 20_000n ? latestBlock - 20_000n : 0n;
        const logs = await publicClient.getLogs({
          address: contractAddress,
          event: proofOfStudyAbi[4],
          fromBlock,
          toBlock: latestBlock
        });

        setRecentCheckIns(
          logs
            .slice(-5)
            .reverse()
            .map((log) => ({
              user: log.args.user as Address,
              day: log.args.day || 0n,
              totalCheckIns: log.args.totalCheckIns || 0n,
              currentStreak: log.args.currentStreak || 0n
            }))
        );
      } catch {
        setEventError('Recent rewards are unavailable for this RPC endpoint.');
      }
    }

    loadEvents();
  }, [publicClient, isWrongNetwork, isConfirmed]);

  function handlePrimaryAction() {
    if (!isConnected) {
      setIsWalletOpen(true);
      return;
    }
    if (isWrongNetwork) {
      switchChain({ chainId: activeChain.id });
      return;
    }
    if (!hasContract || hasCheckedInToday) return;

    writeContract({
      address: contractAddress,
      abi: proofOfStudyAbi,
      functionName: 'checkIn',
      dataSuffix: baseBuilderDataSuffix
    });
  }

  function handleLookup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = lookupAddress.trim();
    if (!isAddress(value)) return;
    setSubmittedLookup(value);
    setTimeout(() => {
      refetchLookupProfile();
      refetchLookupStatus();
    }, 0);
  }

  const nextReward = rewards.find((reward) => {
    const current = reward.metric === 'streak' ? myProfile.currentStreak : myProfile.totalCheckIns;
    return current < BigInt(reward.target);
  });

  const isPrimaryDisabled =
    isConnected &&
    (Boolean(hasCheckedInToday) ||
      !hasContract ||
      isWritePending ||
      isConfirming ||
      isSwitchingNetwork);

  return (
    <main className="min-h-screen bg-[#fff8ef] text-ink">
      <WalletDialog isOpen={isWalletOpen} onClose={() => setIsWalletOpen(false)} />

      <section className="border-b border-orange-100 bg-[linear-gradient(180deg,#fff3df_0%,#fff8ef_100%)]">
        <div className="mx-auto grid max-w-6xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-10">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-3 py-2 text-sm font-semibold text-orange-700">
              <GraduationCap size={16} />
              Zero-cost learning rewards on Base
            </div>
            <div>
              <h1 className="text-4xl font-bold text-ink sm:text-5xl">ProofOfStudy</h1>
              <p className="mt-3 max-w-xl text-lg leading-7 text-stone-700">
                Check in once a day, see your reward progress immediately, and keep a public record of your learning streak.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                aria-label={checkInButtonLabel}
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-lg bg-orange-600 px-5 font-semibold text-white shadow-soft transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-stone-300"
                disabled={isPrimaryDisabled}
                onClick={handlePrimaryAction}
              >
                {isWritePending || isConfirming || isSwitchingNetwork ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Gift size={20} />
                )}
                {checkInButtonLabel}
              </button>
              <button
                aria-label="Choose wallet"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-orange-200 bg-white px-4 font-semibold text-stone-700"
                onClick={() => setIsWalletOpen(true)}
              >
                <Wallet size={18} />
                {isConnected ? formatAddress(address) : 'Choose Wallet'}
              </button>
            </div>

            <div className="flex items-center gap-2 text-sm text-stone-600">
              <ShieldCheck size={16} className="text-orange-600" />
              No token purchase is required. Network gas may still apply for onchain check-ins.
            </div>
          </div>

          <div className="rounded-lg border border-orange-100 bg-white p-5 shadow-soft">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-stone-500">Instant reward</p>
                <p className="mt-1 text-3xl font-bold text-ink">
                  {myProfile.totalCheckIns > 0n ? 'Unlocked' : 'Ready'}
                </p>
              </div>
              <div className="rounded-lg bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-700">
                {activeChain.name}
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-[#fff8ef] p-4">
                <p className="text-sm text-stone-500">Total users</p>
                <p className="mt-2 text-2xl font-semibold">
                  {hasContract && totalUsers !== undefined ? totalUsers.toString() : '0'}
                </p>
              </div>
              <div className="rounded-lg bg-[#fff8ef] p-4">
                <p className="text-sm text-stone-500">Next reward</p>
                <p className="mt-2 text-sm font-semibold">
                  {nextReward ? nextReward.name : 'All rewards unlocked'}
                </p>
              </div>
              <div className="col-span-2 rounded-lg bg-[#fff8ef] p-4">
                <p className="text-sm text-stone-500">Builder attribution</p>
                <p className="mt-2 text-sm font-semibold">{baseBuilderCode}</p>
              </div>
              <div className="col-span-2 rounded-lg bg-[#fff8ef] p-4">
                <p className="text-sm text-stone-500">Contract</p>
                <a className="mt-2 block break-all text-sm font-semibold text-orange-700 underline" href={contractUrl(contractAddress)} rel="noreferrer" target="_blank">
                  {formatAddress(contractAddress)}
                </a>
              </div>
              <div className="col-span-2 rounded-lg bg-[#fff8ef] p-4">
                <p className="text-sm text-stone-500">UTC reward day</p>
                <p className="mt-2 text-sm font-semibold">{currentUtcDay()}</p>
              </div>
            </div>
            {transactionHash && (
              <p className="mt-4 break-all text-sm text-stone-500">
                Transaction:{' '}
                <a className="font-semibold text-orange-700 underline" href={transactionUrl(transactionHash)} rel="noreferrer" target="_blank">
                  {transactionHash}
                </a>
              </p>
            )}
            {isConfirmed && (
              <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-green-700">
                <CheckCircle2 size={16} />
                Reward progress recorded.
              </p>
            )}
            {txError && <p className="mt-4 text-sm font-semibold text-red-600">{txError}</p>}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-5 px-4 py-5 sm:px-6">
        {!hasContract && (
          <div className="rounded-lg border border-orange-200 bg-white p-4 text-sm font-medium text-orange-800">
            Set NEXT_PUBLIC_CONTRACT_ADDRESS after deploying the contract.
          </div>
        )}

        {isWrongNetwork && (
          <div className="flex flex-col gap-3 rounded-lg border border-orange-200 bg-white p-4 text-sm text-stone-700 sm:flex-row sm:items-center sm:justify-between">
            <span>Your wallet is connected to a different network.</span>
            <button
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-ink px-4 font-semibold text-white disabled:opacity-60"
              disabled={isSwitchingNetwork}
              onClick={() => switchChain({ chainId: activeChain.id })}
            >
              {isSwitchingNetwork ? 'Switching...' : `Switch to ${activeChain.name}`}
            </button>
          </div>
        )}

        <section className="space-y-3">
          <div className="flex items-center gap-3">
            <Sparkles className="text-orange-600" />
            <h2 className="text-2xl font-semibold">My Rewards</h2>
          </div>
          <div className="rounded-lg border border-orange-100 bg-white p-4 shadow-soft">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-stone-500">Connected wallet</p>
                <p className="mt-1 break-all font-semibold">{formatAddress(address)}</p>
              </div>
              <span className="w-fit rounded-lg bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-700">
                {isConnected ? (hasCheckedInToday ? 'Claimed today' : 'Ready to claim') : 'Wallet not connected'}
              </span>
            </div>
            <div className="mt-4">
              {isMyProfileLoading ? <p className="text-stone-500">Loading rewards...</p> : <ProfileStats profile={myProfile} />}
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-lg border border-orange-100 bg-white p-5 shadow-soft">
            <div className="flex items-center gap-3">
              <Award className="text-orange-600" />
              <h2 className="text-2xl font-semibold">Reward Track</h2>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {rewards.map((reward) => {
                const current = reward.metric === 'streak' ? myProfile.currentStreak : myProfile.totalCheckIns;
                const unlocked = current >= BigInt(reward.target);
                return (
                  <div
                    className={`rounded-lg border p-4 ${
                      unlocked ? 'border-orange-300 bg-orange-50' : 'border-stone-200 bg-[#fffaf3]'
                    }`}
                    key={reward.name}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{reward.name}</p>
                        <p className="mt-1 text-sm text-stone-500">{reward.note}</p>
                      </div>
                      <span className="rounded-lg bg-white px-3 py-1 text-sm font-semibold">
                        {unlocked ? 'Unlocked' : `${reward.target}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg border border-orange-100 bg-white p-5 shadow-soft">
            <div className="flex items-center gap-3">
              <BookOpenCheck className="text-orange-600" />
              <h2 className="text-2xl font-semibold">Recent Activity</h2>
            </div>
            <div className="mt-4 space-y-3">
              {recentCheckIns.length > 0 ? (
                recentCheckIns.map((item, index) => (
                  <div
                    className="flex flex-col gap-2 rounded-lg border border-stone-200 bg-[#fffaf3] p-4 sm:flex-row sm:items-center sm:justify-between"
                    key={`${item.user}-${item.day.toString()}-${index}`}
                  >
                    <p className="font-medium">{formatAddress(item.user)} claimed a study reward</p>
                    <p className="text-sm text-stone-500">
                      {formatUnits(item.totalCheckIns, 0)} days, {formatUnits(item.currentStreak, 0)} streak
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-stone-500">
                  {eventError || 'No recent rewards found for the current contract.'}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-orange-100 bg-white p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <Search className="text-orange-600" />
            <h2 className="text-2xl font-semibold">Wallet Lookup</h2>
          </div>
          <form className="mt-4 flex flex-col gap-3 sm:flex-row" onSubmit={handleLookup}>
            <input
              className="min-h-12 flex-1 rounded-lg border border-stone-300 px-4 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              placeholder="Enter a wallet address"
              value={lookupAddress}
              onChange={(event) => setLookupAddress(event.target.value)}
            />
            <button
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-ink px-5 font-semibold text-white disabled:opacity-50"
              disabled={!lookupIsValid || lookupAddress.trim() === '' || !hasContract || isWrongNetwork}
            >
              <Search size={18} />
              Search
            </button>
          </form>
          {!lookupIsValid && <p className="mt-3 text-sm text-red-600">Enter a valid wallet address.</p>}
          {submittedLookup && (
            <div className="mt-5">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="break-all text-sm text-stone-500">Profile for {submittedLookup}</p>
                <span className="w-fit rounded-lg bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-700">
                  {lookupCheckedInToday ? 'Claimed today' : 'Not claimed today'}
                </span>
              </div>
              {isLookupLoading ? <p className="text-stone-500">Loading wallet profile...</p> : <ProfileStats profile={lookupProfile} />}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

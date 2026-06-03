import type { Address } from 'viem';

export const contractAddress = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  '0x0000000000000000000000000000000000000000') as Address;

export const proofOfStudyAbi = [
  {
    type: 'function',
    name: 'checkIn',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'getProfile',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [
      {
        type: 'tuple',
        components: [
          { name: 'totalCheckIns', type: 'uint256' },
          { name: 'currentStreak', type: 'uint256' },
          { name: 'longestStreak', type: 'uint256' },
          { name: 'lastCheckInDay', type: 'uint256' }
        ]
      }
    ],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'hasCheckedInToday',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ type: 'bool' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'totalUsers',
    inputs: [],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'event',
    name: 'StudyCheckedIn',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'day', type: 'uint256', indexed: true },
      { name: 'totalCheckIns', type: 'uint256', indexed: false },
      { name: 'currentStreak', type: 'uint256', indexed: false }
    ]
  }
] as const;

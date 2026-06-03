import '@nomicfoundation/hardhat-toolbox-viem';
import type { HardhatUserConfig } from 'hardhat/config';

const privateKey = process.env.PRIVATE_KEY;

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.24',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    baseSepolia: {
      url: process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org',
      accounts: privateKey ? [privateKey] : []
    }
  }
};

export default config;

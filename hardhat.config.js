import '@nomicfoundation/hardhat-toolbox-viem';
var privateKey = process.env.PRIVATE_KEY;
var config = {
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

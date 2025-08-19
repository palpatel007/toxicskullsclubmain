import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet } from 'wagmi/chains';
import { defineChain } from 'viem';

export const apechain = defineChain({
  id: 33139,
  name: 'ApeChain',
  network: 'apechain',
  nativeCurrency: { name: 'ApeCoin', symbol: 'APE', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.apechain.com'] },
    public: { http: ['https://rpc.apechain.com'] },
  },
  blockExplorers: {
    default: { name: 'ApeScan', url: 'https://apescan.io' },
  },
});

export const config = getDefaultConfig({
  appName: 'Toxic Skulls Club',
  projectId: 'your-project-id', // Replace with your WalletConnect project ID
  chains: [mainnet, apechain],
  ssr: false,
});

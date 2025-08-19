import { useEffect, useState } from 'react';

export function useWalletPersistence() {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    // Check for persisted wallet connection on mount
    const persistedConnection = localStorage.getItem('wallet-connected');
    const persistedAddress = localStorage.getItem('wallet-address');
    
    if (persistedConnection === 'true' && persistedAddress) {
      setIsConnected(true);
      setWalletAddress(persistedAddress);
    }
  }, []);

  const connectWallet = (address: string) => {
    setIsConnected(true);
    setWalletAddress(address);
    localStorage.setItem('wallet-connected', 'true');
    localStorage.setItem('wallet-address', address);
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress(null);
    localStorage.removeItem('wallet-connected');
    localStorage.removeItem('wallet-address');
  };

  return {
    isConnected,
    walletAddress,
    connectWallet,
    disconnectWallet,
  };
}

import { useState, useEffect } from 'react';
import { Collection } from '../components/CollectionSelector';

export interface NFTAttribute {
  trait_type: string;
  value: string;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  image_url: string;
  external_url?: string;
  image_uri?: string;
  imageUrl?: string;
  attributes: NFTAttribute[];
  dna: string;
  edition: number;
  date: number;
  compiler: string;
}

export interface NFT {
  contract_address: string;
  token_standard: string;
  token_id: string;
  chain: string;
  chain_id: number;
  name: string;
  symbol: string;
  metadata: NFTMetadata;
  balance: string;
  last_acquired: string;
}

export interface APIResponse {
  wallet: string;
  contract: string;
  total: number;
  nfts: NFT[];
}

// const WALLET = '0x5Ecd3D5EE0251a7e185E630b936A29c01E90041b';
// const WALLET2 = '0xb1cd3b77c87b2114d2c408c57c6348cc38be300f';
// const WALLET = '0xb4b6e7f0af42260179d654276d7d3a5a223b3ef8';
// const WALLET = '0x435292fe4012Dd1fe78D35C84e1762D19197EdB2';

export const useNFTs = (wallet?: string, collection?: Collection) => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!wallet || !collection) {
      setNfts([]);
      return;
    }

    const fetchNFTs = async () => {
      setLoading(true);
      setError(null);
      try {
        // Use different API endpoints based on chain ID
        let apiUrl: string;

        if (collection.chainId === 33139) {
          // ApeChain - use a different endpoint or modify the existing one
          apiUrl = `http://192.168.1.3:3001/api/nfts?wallet=${wallet}&contract=${collection.contract}&page=1&limit=1000&chainId=${collection.chainId}`;
        } else {
          // Ethereum Mainnet
          apiUrl = `http://192.168.1.3:3001/api/nfts?wallet=${wallet}&contract=${collection.contract}&page=1&limit=1000`;
        }

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          mode: 'cors',
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`API request failed: ${response.status} - ${errorData.error || response.statusText}`);
        }

        const data: APIResponse = await response.json();
        setNfts(data.nfts || []);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch NFTs';
        setError(errorMessage);
        console.error('Error fetching NFTs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, [wallet, collection]);

  return { nfts, loading, error };
};

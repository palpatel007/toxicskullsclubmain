import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import toxicSkullsClubLogo from '../assets/CollectionsLogo/ToxicSkullsClub.jpg';
import skullsOfMayhemLogo from '../assets/CollectionsLogo/skullsofmayhem.jpg';
import skullsOnApeLogo from '../assets/CollectionsLogo/skullonape.png';

export interface Collection {
    id: string;
    name: string;
    contract: string;
    chainId: number;
    description: string;
    image: string;
}

interface CollectionSelectorProps {
    selectedCollection: Collection;
    onCollectionChange: (collection: Collection) => void;
    // Optional. When provided, the component filters by this chain and hides local chain buttons.
    activeChainId?: number;
}

export const COLLECTIONS: Collection[] = [
    {
        id: 'toxic-skulls-club',
        name: 'Toxic Skulls Club',
        contract: '0x5ca8dd7f8e1ee6d0c27a7be6d9f33ef403fbcdd8',
        chainId: 1,
        description: 'Ethereum Mainnet Collection',
        image: toxicSkullsClubLogo
    },
    {
        id: 'skulls-on-ape',
        name: 'Skulls on Ape',
        contract: '0x20e3c7d2ecd264615b57478ebc52acdcc5d92e37',
        chainId: 33139,
        description: 'ApeChain Collection',
        image: skullsOnApeLogo
    },
    {
        id: 'skulls-of-mayhem',
        name: 'Skulls of Mayhem',
        contract: '0x32e14d6f3dda2b95e505b14eb4552fd3eeaa1f0d',
        chainId: 1,
        description: 'Ethereum Mainnet Collection',
        image: skullsOfMayhemLogo
    }
];

const CHAINS = [
    { id: 1, name: 'Ethereum', icon: '🔷' },
    { id: 33139, name: 'ApeChain', icon: '🦍' }
];

export const CollectionSelector = ({ selectedCollection, onCollectionChange, activeChainId }: CollectionSelectorProps) => {
    const [selectedChain, setSelectedChain] = useState(selectedCollection.chainId);

    // If parent controls chain via wallet, prefer it
    const effectiveChainId = activeChainId ?? selectedChain;

    // Filter collections based on effective chain
    const filteredCollections = useMemo(
        () => COLLECTIONS.filter((collection) => collection.chainId === effectiveChainId),
        [effectiveChainId]
    );

    // Sync selected collection to current chain when needed
    useEffect(() => {
        if (selectedCollection.chainId !== effectiveChainId) {
            const first = filteredCollections[0];
            if (first) onCollectionChange(first);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [effectiveChainId]);

    const handleChainChange = (chainId: number) => {
        if (activeChainId) return; // ignore clicks when controlled by wallet
        setSelectedChain(chainId);
        const firstCollection = COLLECTIONS.find((c) => c.chainId === chainId);
        if (firstCollection) onCollectionChange(firstCollection);
    };

    return (
        <div className="collection-selector mb-6">
            {/* Chain Selection Buttons - hidden when controlled by wallet */}
            {!activeChainId && (
                <div className="mb-4 sm:mb-6">
                    <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white">
                        <span className="gradient-text-green">Select</span>{' '}
                        <span className="gradient-text-rainbow">Chain</span>
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 sm:mb-6">
                        {CHAINS.map((chain) => (
                            <motion.button
                                key={chain.id}
                                className={`chain-button px-4 sm:px-6 py-2 sm:py-3 rounded-lg border-2 transition-all duration-300 flex items-center space-x-2 sm:space-x-3 ${effectiveChainId === chain.id
                                        ? 'border-green-400 bg-green-900/20 shadow-lg shadow-green-500/25'
                                        : 'border-gray-600 bg-gray-800/50 hover:border-gray-400 hover:bg-gray-700/50'
                                    }`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleChainChange(chain.id)}
                            >
                                <div className="text-xl sm:text-2xl">{chain.icon}</div>
                                <div>
                                    <h4 className="font-semibold text-white text-xs sm:text-sm">{chain.name}</h4>
                                    <p className="text-gray-400 text-xs">{chain.id === 1 ? 'Mainnet' : 'ApeChain Network'}</p>
                                </div>
                                {effectiveChainId === chain.id && (
                                    <motion.div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-400 rounded-full" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.2 }} />
                                )}
                            </motion.button>
                        ))}
                    </div>
                </div>
            )}

            {/* Collection Selection */}
            <div>
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white">
                    <span className="gradient-text-green">Select</span>{' '}
                    <span className="gradient-text-rainbow">Collection</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
                    {filteredCollections.map((collection) => (
                        <motion.div
                            key={collection.id}
                            className={`collection-card cursor-pointer rounded-lg p-3 sm:p-4 border-2 transition-all duration-300 ${selectedCollection.id === collection.id
                                    ? 'border-green-400 bg-green-900/20 shadow-lg shadow-green-500/25'
                                    : 'border-gray-600 bg-gray-800/50 hover:border-gray-400 hover:bg-gray-700/50'
                                }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onCollectionChange(collection)}
                        >
                            <div className="flex items-center space-x-2 sm:space-x-3">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden flex items-center justify-center">
                                    <img src={collection.image} alt={collection.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-white text-xs sm:text-sm">{collection.name}</h4>
                                    <p className="text-gray-400 text-xs">{collection.description}</p>
                                    <p className="text-gray-500 text-xs font-mono">{collection.contract.slice(0, 6)}...{collection.contract.slice(-4)}</p>
                                </div>
                                {selectedCollection.id === collection.id && (
                                    <motion.div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-400 rounded-full" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.2 }} />
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {filteredCollections.length === 0 && (
                    <div className="text-center py-6 sm:py-8">
                        <div className="text-2xl sm:text-3xl lg:text-4xl mb-2">🔗</div>
                        <p className="text-gray-400 text-xs sm:text-sm lg:text-base">No collections available on this chain</p>
                    </div>
                )}
            </div>
        </div>
    );
};

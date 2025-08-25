import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Download } from 'lucide-react';
import { WalletButton } from './WalletButton';
import { useAccount } from 'wagmi';

interface MobileNavProps {
  onSidebarToggle: () => void;
  isSidebarOpen: boolean;
  selectedFormat: string;
  onFormatChange: (format: string) => void;
  selectedCollection?: {
    id: string;
    name: string;
    contract: string;
    chainId: number;
    description: string;
    image: string;
  };
}

const baseDownloadOptions = [
  {
    id: 'Toxic PFP',
    name: 'Toxic PFP',
    description: 'High Quality PNG ',
    icon: '💀',
    color: 'bg-purple-500'
  },
  {
    id: 'Toxic Transparent',
    name: 'Toxic Transparent',
    description: 'Transparent Background PNG',
    icon: '👻',
    color: 'bg-orange-500'
  },
  {
    id: 'Pre-Toxic PFP',
    name: 'Pre-Toxic PFP',
    description: 'High Quality PNG ',
    icon: '☠️',
    color: 'bg-green-500'
  },
  {
    id: 'Pre-Toxic Transparent',
    name: 'Pre-Toxic Transparent',
    description: 'Transparent Background PNG',
    icon: '👻',
    color: 'bg-blue-500'
  }
];

export const MobileNav = ({ 
  onSidebarToggle, 
  isSidebarOpen, 
  selectedFormat, 
  onFormatChange,
  selectedCollection 
}: MobileNavProps) => {
  const { address } = useAccount();

  // Function to get the appropriate PFP title based on collection
  const getPFPTitle = (collectionId: string) => {
    switch (collectionId) {
      case 'skulls-of-mayhem':
        return 'Mayhem PFP';
      case 'skulls-on-ape':
        return 'Skull on Ape PFP';
      case 'toxic-skulls-club':
        return 'Toxic PFP';
      default:
        return 'Toxic PFP';
    }
  };

  // Function to get collection information based on selected collection
  const getCollectionInfo = (collectionId: string) => {
    switch (collectionId) {
      case 'skulls-of-mayhem':
        return {
          title: 'About Skulls of Mayhem',
          description: 'Skulls of Mayhem is a unique collection featuring 9,999 hand-drawn skull NFTs with over 390 unique traits. Each skull represents chaos, rebellion, and the raw energy of the crypto world. This collection embodies the spirit of mayhem and freedom in the NFT space.',
          stats: '9,999 NFTs • 390+ Traits • Ethereum'
        };
      case 'skulls-on-ape':
        return {
          title: 'About Skulls on Ape',
          description: 'Skulls on Ape is an exclusive collection on ApeChain featuring unique skull designs fused with ape characteristics. This collection represents the fusion of two iconic NFT communities, creating a new breed of digital collectibles with distinctive ape-skull hybrid traits.',
          stats: 'Limited Edition • ApeChain Exclusive • Hybrid Traits'
        };
      case 'toxic-skulls-club':
      default:
        return {
          title: 'About Toxic Skulls Club',
          description: 'Toxic Skulls Club is the OG collection of 9,999 skulls with over 390 hand drawn traits!.',
          stats: '9,999 NFTs • 390+ Traits • OG Collection'
        };
    }
  };

  // Filter options based on selected collection (same logic as desktop sidebar)
  let downloadOptions;
  
  if (selectedCollection?.id === 'toxic-skulls-club') {
    // Show all options for Toxic Skulls Club
    downloadOptions = baseDownloadOptions;
  } else if (selectedCollection?.id === 'skulls-of-mayhem' || selectedCollection?.id === 'skulls-on-ape') {
    // Show only PFP options for Skulls of Mayhem and Skulls on Ape
    downloadOptions = baseDownloadOptions.filter(option => 
      option.id === 'Pre-Toxic PFP' 
    ).map(option => ({
      ...option,
      name: getPFPTitle(selectedCollection.id),
      id: getPFPTitle(selectedCollection.id) // Update ID to match the new name
    }));
  } else {
    // Default: show all options except Toxic Transparent and Pre-Toxic Transparent
    downloadOptions = baseDownloadOptions.filter(option => 
      option.id !== 'Toxic Transparent' && option.id !== 'Pre-Toxic Transparent'
    );
  }

  // Get collection information
  const collectionInfo = selectedCollection ? getCollectionInfo(selectedCollection.id) : getCollectionInfo('toxic-skulls-club');

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gray-800">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left side - Menu and Logo */}
          <div className="flex items-center gap-3">
            {/* Menu Toggle - Only show when wallet is connected */}
            {address && (
              <motion.button
                onClick={onSidebarToggle}
                className="p-2 bg-white/10 rounded-lg border border-white/20 hover:bg-white/20 transition-colors flex items-center justify-center"
                whileTap={{ scale: 0.95 }}
              >
                {isSidebarOpen ? (
                  <X className="w-5 h-5 text-white" />
                ) : (
                  <Menu className="w-5 h-5 text-white" />
                )}
              </motion.button>
            )}

            {/* Logo and Title */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-8 sm:w-12 sm:h-10 rounded-full flex items-center justify-center">
                <img 
                  src="https://i0.wp.com/toxicskullsclub.io/wp-content/uploads/2024/02/logo.7bc81c1.png" 
                  alt="Toxic Skulls Club" 
                  className="w-full h-full object-contain"
                  style={{ filter: 'brightness(0) invert(1)' }}
                />
              </div>
              {!address && (
                <div className="flex items-center">
                  <h1 className="text-xs sm:text-sm font-bold whitespace-nowrap">
                    <span className="gradient-text-green">Toxic Skulls Club</span>
                  </h1>
                </div>
              )}
            </div>
          </div>

          {/* Right side - Wallet Button */}
          <div className="flex items-center">
            <WalletButton />
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={onSidebarToggle}
            />
            
            {/* Sidebar */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed top-0 left-0 h-full w-80 bg-white z-50 overflow-y-auto"
            >
              {/* Close Button */}
              <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-black">Download Options</h2>
                <motion.button
                  onClick={onSidebarToggle}
                  className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-5 h-5 text-black" />
                </motion.button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Download Options */}
                <div className="space-y-2">
                  {downloadOptions.map((option) => (
                    <motion.div
                      key={option.id}
                      className={`download-option group ${selectedFormat === option.id ? 'ring-2 ring-green-400 ring-opacity-75' : ''}`}
                      onClick={() => {
                        onFormatChange(option.id);
                        onSidebarToggle();
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`download-icon ${option.color}`}>
                          {option.icon}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-black group-hover:text-white transition-colors duration-300">{option.name}</div>
                          <div className="text-sm text-gray-600 group-hover:text-gray-300 transition-colors duration-300">{option.description}</div>
                        </div>
                      </div>
                      <div className={`download-radio ${selectedFormat === option.id ? 'selected' : ''}`}></div>
                    </motion.div>
                  ))}
                </div>
              
                {/* Collection Information */}
                <div className="mt-6 p-4 bg-white rounded-lg border border-gray-300">
                  <h3 className="text-lg font-bold text-black mb-2">
                    {collectionInfo.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {collectionInfo.description}
                  </p>
                  <div className="text-xs text-gray-500 font-semibold bg-gray-100 px-2 py-1 rounded">
                    {collectionInfo.stats}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

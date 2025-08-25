import { useState } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { motion } from 'framer-motion';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { MobileNav } from '../components/MobileNav';
import { WalletButton } from '../components/WalletButton';
import { NFTGrid } from '../components/NFTGrid';
import { CollectionSelector, Collection, COLLECTIONS } from '../components/CollectionSelector';
import { useNFTs } from '../hooks/useNFTs';
import { useIsMobile } from '../hooks/use-mobile';
import toxicSkullsClubLogo from '../assets/CollectionsLogo/ToxicSkullsClub.jpg';
import skullsOfMayhemLogo from '../assets/CollectionsLogo/skullsofmayhem.jpg';
import skullsOnApeLogo from '../assets/CollectionsLogo/skullonape.png';

const Index = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const isMobile = useIsMobile();
  const [selectedFormat, setSelectedFormat] = useState('Toxic PFP');
  const [selectedCollection, setSelectedCollection] = useState<Collection>(COLLECTIONS[0]);
  const [formatChanged, setFormatChanged] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const { nfts, loading, error } = useNFTs(address, selectedCollection);

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

  const handleFormatChange = (format: string) => {
    setSelectedFormat(format);
  };

  const handleCollectionChange = (collection: Collection) => {
    setSelectedCollection(collection);
    // Automatically set the active tab to the appropriate PFP title when collection changes
    const newFormat = getPFPTitle(collection.id);
    setSelectedFormat(newFormat);
    // Show brief visual feedback that format was auto-changed
    setFormatChanged(true);
    setTimeout(() => setFormatChanged(false), 2000); // Hide after 2 seconds
  };

  const handleMobileSidebarToggle = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className="min-h-screen main-bg-image text-white">
      {/* Mobile Navigation */}
      <MobileNav 
        onSidebarToggle={handleMobileSidebarToggle}
        isSidebarOpen={isMobileSidebarOpen}
        selectedFormat={selectedFormat}
        onFormatChange={handleFormatChange}
        selectedCollection={selectedCollection}
      />
      
      {/* Desktop Header */}
      <Header selectedCollection={selectedCollection} />
      
      <div className="flex">
        {/* Left Sidebar - Only show when wallet is connected */}
        {isConnected && (
          <div className="w-80 flex-shrink-0 p-4 hidden lg:block">
            <Sidebar 
              selectedFormat={selectedFormat}
              onFormatChange={handleFormatChange}
              selectedCollection={selectedCollection}
              formatChanged={formatChanged}
            />
          </div>
        )}

        {/* Right Main Content */}
        <div className={`${isConnected ? 'flex-1' : 'w-full'} p-4 lg:p-8 pt-16 lg:pt-4`}>
          <div className="content-panel">
            {!isConnected ? (
              <>
                <div className="w-full min-h-80 sm:min-h-96 rounded-lg flex items-center justify-center p-4 sm:p-8">
                    <div className="flex flex-col items-center justify-center space-y-6 sm:space-y-8">
                      {/* Collection Logos */}
                      <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 md:space-x-8 lg:space-x-12">
                        {/* Toxic Skulls Club */}
                        <div className="text-center">
                          <img 
                            src={toxicSkullsClubLogo}
                            alt="Toxic Skulls Club" 
                            className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-lg shadow-lg hover:scale-105 transition-transform duration-300"
                          />
                          <div className="text-xs sm:text-sm text-white mt-2 font-semibold">Toxic Skulls Club</div>
                        </div>
                        
                        {/* Skulls on Ape */}
                        <div className="text-center">
                          <img 
                            src={skullsOnApeLogo}
                            alt="Skulls on Ape" 
                            className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-lg shadow-lg hover:scale-105 transition-transform duration-300"
                          />
                          <div className="text-xs sm:text-sm text-white mt-2 font-semibold">Skulls on Ape</div>
                        </div>
                        
                        {/* Skulls of Mayhem */}
                        <div className="text-center">
                          <img 
                            src={skullsOfMayhemLogo}
                            alt="Skulls of Mayhem" 
                            className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-lg shadow-lg hover:scale-105 transition-transform duration-300"
                          />
                          <div className="text-xs sm:text-sm text-white mt-2 font-semibold">Skulls of Mayhem</div>
                        </div>
                      </div>
                      
                      {/* Call to Action Text */}
                      <div className="text-center mb-6">
                        <h2 className="text-lg sm:text-xl font-bold">
                          <span className="gradient-text-green">Connect your wallet to access your NFT</span>
                        </h2>
                      </div>
                      
                      {/* Wallet Button */}
                      <div className="text-center">
                        <WalletButton />
                      </div>
                    </div>
                  </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-4">
                  <span className="gradient-text-green">Your</span>{' '}
                  <span className="gradient-text-rainbow">{selectedCollection.name}</span>{' '}
                  <span className="gradient-text-green">Collection</span>
                </h2>
                
                <CollectionSelector 
                  activeChainId={chainId}
                  selectedCollection={selectedCollection}
                  onCollectionChange={handleCollectionChange}
                />
                
                <p className="text-gray-300 mb-6">
                  {loading ? 'Loading your NFTs...' : 
                   error ? 'No NFTs found in this collection' :
                   nfts.length === 0 ? 'No NFTs found in this collection' :
                   `${nfts.length} NFTs found in your wallet`}
                </p>
                
                <NFTGrid 
                  nfts={nfts}
                  loading={loading}
                  error={error}
                  downloadFormat={selectedFormat}
                  showGLB={selectedFormat === 'GLB' || selectedFormat === 'FBX'}
                  selectedCollection={selectedCollection}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

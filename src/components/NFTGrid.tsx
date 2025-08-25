import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NFTCard } from './NFTCard';
import { NFT } from '../hooks/useNFTs';
import { Loader, AlertCircle } from 'lucide-react';

interface NFTGridProps {
  nfts: NFT[];
  loading: boolean;
  error?: string | null;
  downloadFormat: string;
  showGLB?: boolean;
  selectedCollection?: {
    id: string;
    name: string;
    contract: string;
    chainId: number;
    description: string;
    image: string;
  };
}

const ITEMS_PER_PAGE = 24;

// Skeleton card component for loading state
const SkeletonCard = ({ index }: { index: number }) => (
  <motion.div
    className="bg-gray-800 border border-white shadow-md rounded-lg overflow-hidden"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
  >
    <div className="relative overflow-hidden">
      {/* Skeleton image */}
      <div className="w-full aspect-square bg-white animate-pulse">
        <div className="w-full h-full bg-gradient-to-r from-white via-gray-100 to-white animate-pulse"></div>
      </div>
    </div>
  </motion.div>
);

export const NFTGrid: React.FC<NFTGridProps> = ({ nfts, loading, error, downloadFormat, showGLB = false, selectedCollection }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(nfts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentNFTs = nfts.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="space-y-6 sm:space-y-8">
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4 lg:gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {Array.from({ length: 12 }, (_, index) => (
            <SkeletonCard key={index} index={index} />
          ))}
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="text-center py-12 sm:py-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex items-center justify-center mb-4">
          <div className="text-3xl sm:text-4xl mb-2">💀</div>
        </div>
        <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white mb-2">
          No NFTs found
        </h3>
        <p className="text-gray-300 text-xs sm:text-sm md:text-base">
          No NFTs available for this collection.
        </p>
      </motion.div>
    );
  }

  if (nfts.length === 0) {
    return (
      <motion.div
        className="text-center py-12 sm:py-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex items-center justify-center mb-4">
          <div className="text-3xl sm:text-4xl mb-2">💀</div>
        </div>
        <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white mb-2">
          No NFTs found
        </h3>
        <p className="text-gray-300 text-xs sm:text-sm md:text-base">
          No NFTs available for this collection.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4 lg:gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {currentNFTs.map((nft, index) => (
            <NFTCard key={nft.token_id} nft={nft} index={index} downloadFormat={downloadFormat} showGLB={showGLB} selectedCollection={selectedCollection} />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Modern Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 sm:px-4 py-2 bg-white text-black border border-white hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 text-sm sm:text-base"
          >
            Previous
          </button>

          {/* Page Numbers - Show fewer on mobile */}
          <div className="flex items-center gap-1 sm:gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => {
                // Show current page, first page, last page, and pages around current
                if (totalPages <= 5) return true;
                if (page === 1 || page === totalPages) return true;
                if (page >= currentPage - 1 && page <= currentPage + 1) return true;
                return false;
              })
              .map((page, index, array) => {
                // Add ellipsis if there's a gap
                const showEllipsis = index > 0 && page - array[index - 1] > 1;
                return (
                  <div key={page} className="flex items-center">
                    {showEllipsis && <span className="px-2 text-white">...</span>}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 sm:w-10 sm:h-10 transition-all duration-200 font-semibold text-sm sm:text-base border border-white ${currentPage === page
                          ? 'bg-white text-black'
                          : 'bg-transparent text-white hover:bg-white hover:text-black'
                        }`}
                    >
                      {page}
                    </button>
                  </div>
                );
              })}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 sm:px-4 py-2 bg-white text-black border border-white hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 text-sm sm:text-base"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

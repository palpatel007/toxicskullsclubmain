import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Eye, X, ZoomIn, ZoomOut } from 'lucide-react';
import { NFT } from '../hooks/useNFTs';
import { toast } from 'react-toastify';
import GLBViewer from './GLBViewer';
import { 
  getToxicTransparentImage, 
  getPreToxicTransparentImage, 
  getPixelArtImage, 
  getGLBFile, 
  getFBXFile 
} from '../utils/imageLoader';
import { useAccount } from 'wagmi';

interface NFTCardProps {
  nft: NFT;
  index: number;
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

// Using imported functions from imageLoader utility

// Skeleton loading component
const ImageSkeleton = () => (
  <div className="w-full h-64 bg-gray-700 animate-pulse rounded-lg">
    <div className="w-full h-full bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-pulse"></div>
  </div>
);

export const NFTCard: React.FC<NFTCardProps> = ({ nft, index, downloadFormat, showGLB, selectedCollection }) => {
  const { address } = useAccount();
  const [modalOpen, setModalOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [toxicSkullsImages, setToxicSkullsImages] = useState<{ gen0: string; gen1: string } | null>(null);
  const [localImageSrc, setLocalImageSrc] = useState<string | null>(null);
  const [glbUrl, setGlbUrl] = useState<string | null>(null);
  const [fbxUrl, setFbxUrl] = useState<string | null>(null);
  const [hasGLB, setHasGLB] = useState(false);
  const [hasFBX, setHasFBX] = useState(false);
  const [localImageLoading, setLocalImageLoading] = useState(false);

  const cleanTokenId = String(nft.token_id).replace(/^0+/, '').trim();

  // Load local images and 3D files only when needed
  useEffect(() => {
    const loadLocalAssets = async () => {
      try {
        setLocalImageLoading(true);
        setLocalImageSrc(null);
        
        // Only load images for the current download format
        if (selectedCollection?.id === 'toxic-skulls-club' && address) {
          if (downloadFormat === 'Toxic Transparent') {
            const image = await getToxicTransparentImage(cleanTokenId, address, selectedCollection.contract, selectedCollection.chainId);
            setLocalImageSrc(image);
          } else if (downloadFormat === 'Pre-Toxic Transparent') {
            const image = await getPreToxicTransparentImage(cleanTokenId, address, selectedCollection.contract, selectedCollection.chainId);
            setLocalImageSrc(image);
          } else if (downloadFormat === 'Pixel Art') {
            const image = await getPixelArtImage(cleanTokenId, address, selectedCollection.contract, selectedCollection.chainId);
            setLocalImageSrc(image);
          }
        }

        // Load 3D files only if showGLB is true
        if (showGLB && address) {
          const glb = await getGLBFile(cleanTokenId, address, selectedCollection.contract, selectedCollection.chainId);
          setGlbUrl(glb);
          setHasGLB(!!glb);

          const fbx = await getFBXFile(cleanTokenId, address, selectedCollection.contract, selectedCollection.chainId);
          setFbxUrl(fbx);
          setHasFBX(!!fbx);
        }
      } catch (error) {
        console.error('Error loading local assets:', error);
      } finally {
        setLocalImageLoading(false);
      }
    };

    loadLocalAssets();
  }, [cleanTokenId, downloadFormat, selectedCollection?.id, showGLB]);

  // Function to fetch and parse Toxic Skulls Club HTML file
  const fetchToxicSkullsImages = async (tokenId: string) => {
    try {
      const htmlUrl = `https://ipfs2.seadn.io/ipfs/bafybeiddmgz7hg5yb5zcklsiemnjnpcnpdp3glvwtyyf4jsh36uaa3gfne/${tokenId}.html`;
      
      const response = await fetch(htmlUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch HTML file');
      }
      
      const htmlContent = await response.text();
      
      // Extract base64 images from the HTML content
      const gen0Match = htmlContent.match(/gen0Img\.src\s*=\s*"([^"]+)"/);
      const gen1Match = htmlContent.match(/gen1Img\.src\s*=\s*"([^"]+)"/);
      
      if (gen0Match && gen1Match) {
        const images = {
          gen0: gen0Match[1],
          gen1: gen1Match[1]
        };
        setToxicSkullsImages(images);
      } else {
        throw new Error('Could not extract images from HTML');
      }
    } catch (error) {
      console.error('Error fetching Toxic Skulls Club images:', error);
      setToxicSkullsImages(null);
    }
  };

  // Get the correct image source with fallbacks
  const getImageSrc = () => {
    if (downloadFormat === 'Pixel Art') {
      return localImageSrc || null;
    }
    
    // Special handling for Toxic Skulls Club collection
    if (selectedCollection?.id === 'toxic-skulls-club') {
      // For Toxic Transparent format, use local transparent images
      if (downloadFormat === 'Toxic Transparent') {
        const transparentImageUrl = localImageSrc;
        return transparentImageUrl || null;
      }
      
      // For Pre-Toxic Transparent format, use local pre-toxic transparent images
      if (downloadFormat === 'Pre-Toxic Transparent') {
        const preToxicTransparentImageUrl = localImageSrc;
        return preToxicTransparentImageUrl || null;
      }
      
      // For Toxic Skulls Club PFP formats, use the HTML images
      if (downloadFormat === 'Pre-Toxic PFP' || downloadFormat === 'Toxic PFP') {
        if (toxicSkullsImages) {
          // Use the dynamically fetched images
          if (downloadFormat === 'Pre-Toxic PFP') {
            return toxicSkullsImages.gen1;
          } else if (downloadFormat === 'Toxic PFP') {
            return toxicSkullsImages.gen0;
          }
        } else {
          // If images are still loading, return null to show loading state
          return null;
        }
      }
    }
    
    // Try multiple image sources for better reliability
    const imageSources = [
      nft.metadata.image_url,
      nft.metadata.image,
      nft.metadata.external_url,
      nft.metadata.image_uri,
      nft.metadata.imageUrl
    ].filter(Boolean); // Remove undefined/null values
    
    return imageSources[currentImageIndex] || null;
  };

  const imageSrc = getImageSrc();

  // Handle image load events
  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    // For Toxic Skulls Club formats, don't try to cycle through image sources
    if (selectedCollection?.id === 'toxic-skulls-club' && (downloadFormat === 'Pre-Toxic PFP' || downloadFormat === 'Toxic PFP' || downloadFormat === 'Toxic Transparent' || downloadFormat === 'Pre-Toxic Transparent')) {
      setImageLoading(false);
      setImageError(true);
      return;
    }
    
    // Try next image source if available
    const imageSources = [
      nft.metadata.image_url,
      nft.metadata.image,
      nft.metadata.external_url,
      nft.metadata.image_uri,
      nft.metadata.imageUrl
    ].filter(Boolean);
    
    if (currentImageIndex < imageSources.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
      setImageLoading(true);
    } else {
    setImageLoading(false);
    setImageError(true);
    }
  };

  // Fetch Toxic Skulls Club images when component mounts (only for PFP formats that need HTML)
  useEffect(() => {
    if (selectedCollection?.id === 'toxic-skulls-club' && (downloadFormat === 'Pre-Toxic PFP' || downloadFormat === 'Toxic PFP')) {
      fetchToxicSkullsImages(cleanTokenId);
    }
  }, [selectedCollection?.id, cleanTokenId, downloadFormat]);

  // Reset loading state when image source changes or download format changes
  useEffect(() => {
    setImageLoading(true);
    setImageError(false);
    setCurrentImageIndex(0);
  }, [imageSrc, downloadFormat]);

  const show3D = downloadFormat === 'GLB' || downloadFormat === 'FBX';

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (downloadFormat === 'GLB') {
        if (!glbUrl) {
          toast.error('GLB file not found for this token.');
          return;
        }
        const response = await fetch(glbUrl);
        if (!response.ok) {
          toast.error('GLB file not found for this token.');
          return;
        }
        const blob = await response.blob();

        if (blob.size === 0) {
          toast.error('No 3D model available.');
          return;
        }

        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `${nft.metadata.name || 'nft-model'}.glb`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(link.href);
        toast.success(`Download started for ${nft.metadata.name} GLB!`);
      } else if (downloadFormat === 'FBX') {
        if (!fbxUrl) {
          toast.error('FBX file not found for this token.');
          return;
        }
        const response = await fetch(fbxUrl);
        if (!response.ok) {
          toast.error('FBX file not found for this token.');
          return;
        }
        const blob = await response.blob();

        if (blob.size === 0) {
          toast.error('FBX file is empty for this token. No 3D model available.');
          return;
        }

        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `${nft.metadata.name || 'nft-model'}.fbx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(link.href);
        toast.success(`Download started for ${nft.metadata.name} FBX!`);
      } else {
        if (downloadFormat === 'Pixel Art') {
          const pixelArtUrl = localImageSrc;
          if (!pixelArtUrl) {
            toast.error('Pixel Art image not found for this token.');
            return;
          }
          const response = await fetch(pixelArtUrl);
          if (!response.ok) {
            toast.error('Pixel Art image not found for this token.');
            return;
          }
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${nft.metadata.name || 'nft-pixelart'}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          toast.success(`Download started for ${nft.metadata.name} Pixel Art!`, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });

        } else {
          // Special handling for Toxic Skulls Club collection
          if (selectedCollection?.id === 'toxic-skulls-club' && toxicSkullsImages) {
            // For Toxic Skulls Club, download the appropriate image
            if (downloadFormat === 'Pre-Toxic PFP') {
              const base64Data = toxicSkullsImages.gen0;
              const response = await fetch(base64Data);
              const blob = await response.blob();
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `${nft.metadata.name || 'nft-image'}.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              window.URL.revokeObjectURL(url);
              toast.success(`Download started for ${nft.metadata.name} ${downloadFormat}!`, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
              });
              return;
            } else if (downloadFormat === 'Toxic PFP') {
              const base64Data = toxicSkullsImages.gen1;
              const response = await fetch(base64Data);
              const blob = await response.blob();
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `${nft.metadata.name || 'nft-image'}.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              window.URL.revokeObjectURL(url);
              toast.success(`Download started for ${nft.metadata.name} ${downloadFormat}!`, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
              });
              return;
            } else if (downloadFormat === 'Toxic Transparent') {
              const transparentImageUrl = localImageSrc;
              if (!transparentImageUrl) {
                toast.error('Toxic Transparent image not found for this token.');
                return;
              }
              const response = await fetch(transparentImageUrl);
              if (!response.ok) {
                toast.error('Toxic Transparent image not found for this token.');
                return;
              }
              const blob = await response.blob();
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `${nft.metadata.name || 'nft-transparent'}.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              window.URL.revokeObjectURL(url);
              toast.success(`Download started for ${nft.metadata.name} ${downloadFormat}!`, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
              });
              return;
            } else if (downloadFormat === 'Pre-Toxic Transparent') {
              const preToxicTransparentImageUrl = localImageSrc;
              if (!preToxicTransparentImageUrl) {
                toast.error('Pre-Toxic Transparent image not found for this token.');
                return;
              }
              const response = await fetch(preToxicTransparentImageUrl);
              if (!response.ok) {
                toast.error('Pre-Toxic Transparent image not found for this token.');
                return;
              }
              const blob = await response.blob();
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `${nft.metadata.name || 'nft-pre-toxic-transparent'}.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              window.URL.revokeObjectURL(url);
              toast.success(`Download started for ${nft.metadata.name} ${downloadFormat}!`, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
              });
              return;
            } else {
              // Fallback to original image for other formats
              const response = await fetch(nft.metadata.image_url, { mode: 'cors' });
              const blob = await response.blob();
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `${nft.metadata.name || 'nft-image'}.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              window.URL.revokeObjectURL(url);
              toast.success(`Download started for ${nft.metadata.name} in ${downloadFormat} format!`, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
              });
              return;
            }
            

          }
          
          // Default download for other collections or non-HTML files
          const response = await fetch(nft.metadata.image_url, { mode: 'cors' });
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${nft.metadata.name || 'nft-image'}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          toast.success(`Download started for ${nft.metadata.name} in ${downloadFormat} format!`, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
      }
    } catch (error) {
      toast.error('Failed to download file.');
    }
  };

  const handleViewImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.innerWidth < 768) {
      setZoom(1.5);
    } else {
      setZoom(1);
    }
    setModalOpen(true);
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleViewImage(e);
  };

  return (
    <>
      <motion.div
        className="nft-card group bg-white border-[3px] border-white shadow-md hover:shadow-lg transition-all duration-300 rounded-[20px] overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleImageClick}
      >
        <div className="relative overflow-hidden">
          {/* Token ID Display - Top Right Corner Overlay */}
          <div className="absolute top-2 right-2 z-10">
            <span className="text-lg text-black">#{nft.token_id}</span>
          </div>

          {show3D ? (
            <div style={{ width: '100%', height: '10rem', background: '#ddd' }}>
              {downloadFormat === 'GLB' ? (
                hasGLB ? (
                  <GLBViewer modelPath={glbUrl || ''} backgroundColor="#dddddd" />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#ddd',
                    color: '#666',
                    fontSize: '14px',
                    textAlign: 'center',
                    padding: '20px'
                  }}>
                    <div>
                      <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
                      <div>Coming Soon</div>
                    </div>
                  </div>
                )
              ) : downloadFormat === 'FBX' ? (
                hasFBX ? (
                  <GLBViewer modelPath={glbUrl || ''} backgroundColor="#dddddd" />
                ) : (
                  <div className="w-full h-full bg-gray-200 animate-pulse rounded-lg">
                    <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
                        <div className="text-sm font-medium">Coming Soon</div>
                      </div>
                    </div>
                  </div>
                )
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#ddd',
                  color: '#666',
                  fontSize: '14px',
                  textAlign: 'center',
                  padding: '20px'
                }}>
                  <div>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>❓</div>
                    <div>Unknown 3D Format</div>
                    <div style={{ fontSize: '12px', marginTop: '4px' }}>Please select GLB or FBX</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="relative w-full h-64">
              {/* Skeleton loading for Toxic Skulls Club HTML images being fetched */}
              {selectedCollection?.id === 'toxic-skulls-club' && !toxicSkullsImages && (downloadFormat === 'Pre-Toxic PFP' || downloadFormat === 'Toxic PFP') && (
                <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center rounded-lg">
                  <div className="text-center text-gray-300">
                    <div className="text-3xl mb-2">🔄</div>
                    <div className="text-sm font-medium">Loading Toxic Skull #{nft.token_id}</div>
                    <div className="text-xs text-gray-400 mt-1">Fetching images...</div>
                  </div>
                </div>
              )}

              {/* Loading state for local images */}
              {localImageLoading && (downloadFormat === 'Toxic Transparent' || downloadFormat === 'Pre-Toxic Transparent' || downloadFormat === 'Pixel Art') && (
                <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center rounded-lg">
                  <div className="text-center text-gray-300">
                    <div className="text-3xl mb-2">🔄</div>
                    <div className="text-sm font-medium">Loading #{nft.token_id}</div>
                    <div className="text-xs text-gray-400 mt-1">Loading {downloadFormat}...</div>
                  </div>
                </div>
              )}

              {/* Skeleton loading for other cases */}
              {imageLoading && !(selectedCollection?.id === 'toxic-skulls-club' && !toxicSkullsImages && (downloadFormat === 'Pre-Toxic PFP' || downloadFormat === 'Toxic PFP')) && <ImageSkeleton />}

              {/* Loading state when imageSrc is null (Toxic Skulls Club images loading) */}
              {!imageSrc && selectedCollection?.id === 'toxic-skulls-club' && (downloadFormat === 'Pre-Toxic PFP' || downloadFormat === 'Toxic PFP') && (
                <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center rounded-lg">
                  <div className="text-center text-gray-300">
                    <div className="text-3xl mb-2">🔄</div>
                    <div className="text-sm font-medium">Loading Toxic Skull #{nft.token_id}</div>
                    <div className="text-xs text-gray-400 mt-1">Fetching images...</div>
                  </div>
                </div>
              )}

              {/* Error state for Toxic Transparent when image not found */}
              {!imageSrc && selectedCollection?.id === 'toxic-skulls-club' && downloadFormat === 'Toxic Transparent' && (
                <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center rounded-lg">
                  <div className="text-center text-gray-300">
                    <div className="text-3xl mb-2">👻</div>
                    <div className="text-sm font-medium">Toxic Transparent #{nft.token_id}</div>
                    <div className="text-xs text-gray-400 mt-1">Transparent image not found</div>
                  </div>
                </div>
              )}

              {/* Error state */}
              {imageError && (
                <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center rounded-lg">
                  <div className="text-center text-gray-300">
                    <div className="text-3xl mb-2">💀</div>
                    <div className="text-sm font-medium">Skull #{nft.token_id}</div>
                    <div className="text-xs text-gray-400 mt-1">Image loading...</div>
                  </div>
                </div>
              )}

              {/* Actual image */}
              {imageSrc && (
              <img
                src={imageSrc}
                alt={nft.metadata.name}
                className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-110 ${imageLoading ? 'opacity-0' : 'opacity-100'
                  } ${imageError ? 'hidden' : ''}`}
                loading="lazy"
                onLoad={handleImageLoad}
                onError={handleImageError}
                style={{
                  position: imageLoading ? 'absolute' : 'relative',
                  top: 0,
                  left: 0
                }}
              />
              )}
            </div>
          )}
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            initial={false}
          />
          {/* Action Buttons */}
          <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 flex gap-1 sm:gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <motion.button
              onClick={e => { e.stopPropagation(); handleViewImage(e); }}
              className="flex items-center justify-center p-2 sm:p-3 bg-black text-white hover:bg-white hover:text-black border border-black transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>
            <motion.button
              onClick={e => { e.stopPropagation(); handleDownload(e); }}
              className={`flex items-center justify-center p-2 sm:p-3 border transition-colors ${(downloadFormat === 'GLB' && !hasGLB) || (downloadFormat === 'FBX' && !hasFBX)
                  ? 'bg-gray-400 text-gray-600 border-gray-400 cursor-not-allowed'
                  : 'bg-black text-white hover:bg-white hover:text-black border-black'
                }`}
              whileHover={{ scale: (downloadFormat === 'GLB' && !hasGLB) || (downloadFormat === 'FBX' && !hasFBX) ? 1 : 1.1 }}
              whileTap={{ scale: (downloadFormat === 'GLB' && !hasGLB) || (downloadFormat === 'FBX' && !hasFBX) ? 1 : 0.9 }}
              title={
                (downloadFormat === 'GLB' && !hasGLB) || (downloadFormat === 'FBX' && !hasFBX)
                  ? 'No 3D model available for this token'
                  : 'Download'
              }
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>
          </div>
        </div>
        <div className="space-y-1 sm:space-y-2 px-2 sm:px-3 ">
          {/* Show 3D model availability indicator */}
          {(downloadFormat === 'GLB' || downloadFormat === 'FBX') && (
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${(downloadFormat === 'GLB' && hasGLB) || (downloadFormat === 'FBX' && hasFBX)
                  ? 'bg-green-500'
                  : 'bg-yellow-500'
                }`}></div>
              <span className="text-xs text-gray-300">
                {(downloadFormat === 'GLB' && hasGLB) || (downloadFormat === 'FBX' && hasFBX)
                  ? '3D Model Available'
                  : 'Coming Soon'}
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Modal for viewing image or GLB */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10 flex gap-1 sm:gap-2">
            <button
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.2))}
              className="flex items-center justify-center p-2 bg-black text-white hover:bg-white hover:text-black border border-white transition-colors"
            >
              <ZoomOut className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.min(3, z + 0.2))}
              className="flex items-center justify-center p-2 bg-black text-white hover:bg-white hover:text-black border border-white transition-colors"
            >
              <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={e => { e.stopPropagation(); handleDownload(e); }}
              className="flex items-center justify-center p-2 bg-black text-white hover:bg-white hover:text-black border border-white transition-colors"
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={() => setModalOpen(false)}
              className="flex items-center justify-center p-2 bg-white text-black hover:bg-black hover:text-white border border-black transition-colors"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
          {show3D ? (
            <div style={{ width: 480, height: 480, background: '#ddd', borderRadius: 12 }}>
              {downloadFormat === 'GLB' ? (
                hasGLB ? (
                  <GLBViewer modelPath={glbUrl || ''} backgroundColor="#dddddd" />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#ddd',
                    color: '#666',
                    fontSize: '16px',
                    textAlign: 'center',
                    padding: '40px',
                    borderRadius: '12px'
                  }}>
                    <div>
                      <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
                      <div>Coming Soon</div>
                    </div>
                  </div>
                )
              ) : downloadFormat === 'FBX' ? (
                hasFBX ? (
                  <GLBViewer modelPath={glbUrl || ''} backgroundColor="#dddddd" />
                ) : (
                  <div className="w-full h-full bg-gray-200 animate-pulse rounded-lg">
                    <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
                        <div className="text-base font-medium">Coming Soon</div>
                      </div>
                    </div>
                  </div>
                )
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#ddd',
                  color: '#666',
                  fontSize: '16px',
                  textAlign: 'center',
                  padding: '40px',
                  borderRadius: '12px'
                }}>
                  <div>
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
                    <div>Coming Soon</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="relative" style={{ maxHeight: '80vh', maxWidth: '90vw' }}>
              {/* Skeleton loading for modal */}
              {imageLoading && (
                <div className="w-full h-96 bg-gray-200 animate-pulse rounded-lg">
                  <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse"></div>
                </div>
              )}

              {/* Error state for modal */}
              {imageError && (
                <div className="w-full h-96 bg-gray-700 flex items-center justify-center rounded-lg">
                  <div className="text-center text-gray-400">
                    <div className="text-4xl mb-4">🖼️</div>
                    <div className="text-lg">Image not available</div>
                  </div>
                </div>
              )}

              {/* Actual image for modal */}
              <img
                src={imageSrc}
                alt={nft.metadata.name}
                style={{
                  transform: `scale(${zoom})`,
                  maxHeight: '80vh',
                  maxWidth: '90vw',
                  transition: 'transform 0.2s',
                  opacity: imageLoading ? 0 : 1,
                  display: imageError ? 'none' : 'block'
                }}
                className="shadow-2xl border-4 border-white"
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            </div>
          )}
        </div>
      )}
    </>
  );
};

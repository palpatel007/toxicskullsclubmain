import { motion } from 'framer-motion';

interface SidebarProps {
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
  formatChanged?: boolean;
}

const baseDownloadOptions = [
  {
    id: 'Toxic PFP',
    name: 'Toxic PFP',
    description: 'High Quality PNG (2048×2024)',
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
    description: 'High Quality PNG (2048×2024)',
    icon: '☠️',
    color: 'bg-green-500'
  },
  {
    id: 'Pre-Toxic Transparent',
    name: 'Pre-Toxic Transparent',
    description: 'Transparent Background PNG',
    icon: '👻',
    color: 'bg-blue-500'
  },
  // {
  //   id: 'Pixel Art',
  //   name: 'Pixel Art',
  //   description: 'Pixelated Version of Toxic Skulls',
  //   icon: '🎨',
  //   color: 'bg-blue-500'
  // },
  // {
  //   id: 'GLB',
  //   name: '3D Pre-Toxic',
  //   description: 'For Metaverse',
  //   icon: '🌐',
  //   color: 'bg-pink-500'
  // },
  // {
  //   id: 'FBX',
  //   name: '3D Toxic',
  //   description: 'For Animation',
  //   icon: '🎬',
  //   color: 'bg-red-500'
  // }
];

export const Sidebar = ({ selectedFormat, onFormatChange, selectedCollection, formatChanged }: SidebarProps) => {
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

  // Filter options based on selected collection
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
    <motion.aside
      className="w-80 bg-white backdrop-blur-sm rounded-xl shadow-lg p-6 fixed top-28 left-0 h-screen overflow-y-auto z-40 mt-2.5"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="space-y-6">
        {/* Title with dripping effect */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-black mb-2">
            Download Options
          </h2>
          <div className="w-full h-2 bg-gradient-to-r from-green-500 via-purple-500 to-pink-500 rounded-full opacity-50"></div>
        </div>
        
        {/* Download Options */}
        <div className="space-y-0">
          {downloadOptions.map((option) => (
            <motion.div
              key={option.id}
              className={`download-option group ${formatChanged && option.id === selectedFormat ? 'ring-2 ring-green-400 ring-opacity-75' : ''}`}
              onClick={() => onFormatChange(option.id)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              animate={formatChanged && option.id === selectedFormat ? { scale: [1, 1.02, 1] } : {}}
              transition={{ duration: 0.3 }}
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
    </motion.aside>
  );
};

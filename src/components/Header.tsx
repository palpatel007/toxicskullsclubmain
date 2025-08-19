import { motion } from 'framer-motion';
import { WalletButton } from './WalletButton';
import { Collection } from './CollectionSelector';

interface HeaderProps {
  selectedCollection?: Collection;
}

export const Header = ({ selectedCollection }: HeaderProps) => {
  return (
    <motion.header
      className="main-header sticky top-0 z-50"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mx-auto">
        <div className="flex items-center gap-4">
          <motion.div
            className="toxic-logo"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          >
            
            <img 
              src="https://i0.wp.com/toxicskullsclub.io/wp-content/uploads/2024/02/logo.7bc81c1.png" 
              alt="Toxic Skulls Club" 
              style={{ filter: 'brightness(0) invert(1)' }}
            />
            
          </motion.div>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold">
              <span className="gradient-text-green">Toxic Skulls Club Dashboard</span>{' '}
              {/* <span className="gradient-text-rainbow">Hub</span> */}
            </h1>
            {/* <p className="text-gray-300 text-sm">
              {selectedCollection ? `${selectedCollection.name} Collection` : 'Get your Toxic Skulls Assets'}
            </p> */}
          </div>
        </div>
        
        <div className="hidden sm:block">
          <WalletButton />
        </div>
      </div>
    </motion.header>
  );
};

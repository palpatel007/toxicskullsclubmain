// Debug script to check API configuration
console.log('🔍 Debugging API Configuration...\n');

// Check environment variables
console.log('Environment Variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('VITE_API_BASE_URL:', process.env.VITE_API_BASE_URL);
console.log('');

// Simulate the buildApiUrl function
const API_BASE_URL = (process.env.VITE_API_BASE_URL ?? 'http://localhost:3001').replace(/\/$/, '');
console.log('Computed API_BASE_URL:', API_BASE_URL);

const buildApiUrl = (path) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

// Test URLs
console.log('\nTest API URLs:');
console.log('NFTs endpoint:', buildApiUrl('/api/nfts?wallet=0x123&contract=0x456'));
console.log('Secure image endpoint:', buildApiUrl('/api/secure-image/toxic-transparent/123?wallet=0x123&contract=0x456'));

console.log('\n✅ Debug complete!');
console.log('If VITE_API_BASE_URL is undefined, create a .env file with:');
console.log('VITE_API_BASE_URL=https://api.toxicskullsclub.io');

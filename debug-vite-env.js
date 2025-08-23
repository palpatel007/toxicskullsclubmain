// Debug script to check Vite environment variables
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Debugging Vite Environment Variables...\n');

// Read .env file manually
try {
  const envPath = join(__dirname, '.env');
  const envContent = readFileSync(envPath, 'utf8');
  console.log('📄 .env file content:');
  console.log(envContent);
  console.log('');
  
  // Parse environment variables
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      envVars[key.trim()] = value.trim();
    }
  });
  
  console.log('🔧 Parsed environment variables:');
  console.log('VITE_API_BASE_URL:', envVars.VITE_API_BASE_URL);
  console.log('');
  
  // Simulate the buildApiUrl function
  const API_BASE_URL = (envVars.VITE_API_BASE_URL ?? 'http://localhost:3001').replace(/\/$/, '');
  console.log('🎯 Computed API_BASE_URL:', API_BASE_URL);
  
  const buildApiUrl = (path) => {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE_URL}${normalizedPath}`;
  };
  
  // Test URLs
  console.log('\n🚀 Test API URLs:');
  console.log('NFTs endpoint:', buildApiUrl('/api/nfts?wallet=0x123&contract=0x456'));
  console.log('Secure image endpoint:', buildApiUrl('/api/secure-image/toxic-transparent/123?wallet=0x123&contract=0x456'));
  
} catch (error) {
  console.error('❌ Error reading .env file:', error.message);
  console.log('\n💡 Make sure you have a .env file with:');
  console.log('VITE_API_BASE_URL=https://api.toxicskullsclub.io');
}

console.log('\n✅ Debug complete!');

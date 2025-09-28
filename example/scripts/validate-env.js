const fs = require('fs');
const path = require('path');

/**
 * Validate environment variables for deployment
 */
function validateEnvironment() {
  console.log('🔍 Validating environment variables...');
  
  const envPath = path.join(__dirname, '..', '.env');
  
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found!');
    console.log('📝 Please copy env.example to .env and fill in your values:');
    console.log('   cp env.example .env');
    return false;
  }
  
  require('dotenv').config({ path: envPath });
  
  const requiredVars = [
    'PRIVATE_KEY',
    'SEPOLIA_URL',
    'ETHERSCAN_API_KEY'
  ];
  
  const missingVars = [];
  
  for (const varName of requiredVars) {
    if (!process.env[varName] || process.env[varName] === 'your_private_key_here' || 
        process.env[varName] === 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY' ||
        process.env[varName] === 'your_etherscan_api_key') {
      missingVars.push(varName);
    }
  }
  
  if (missingVars.length > 0) {
    console.error('❌ Missing or invalid environment variables:');
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.log('\n📝 Please update your .env file with valid values');
    return false;
  }
  
  // Validate private key format
  const privateKey = process.env.PRIVATE_KEY;
  const isHexWithPrefix = privateKey.startsWith('0x') && privateKey.length === 66;
  const isHexWithoutPrefix = !privateKey.startsWith('0x') && privateKey.length === 64;
  
  if (!isHexWithPrefix && !isHexWithoutPrefix) {
    console.error('❌ Invalid PRIVATE_KEY format. Should be 64 hex characters (with or without 0x prefix)');
    return false;
  }
  
  // Validate Sepolia URL
  if (!process.env.SEPOLIA_URL.includes('sepolia') && !process.env.SEPOLIA_URL.includes('infura')) {
    console.warn('⚠️  SEPOLIA_URL might not be a Sepolia endpoint');
  }
  
  console.log('✅ Environment variables validated successfully!');
  return true;
}

if (require.main === module) {
  const isValid = validateEnvironment();
  process.exit(isValid ? 0 : 1);
}

module.exports = { validateEnvironment };

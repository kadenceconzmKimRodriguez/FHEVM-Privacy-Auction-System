# 🔐 FHEVM Privacy Auction System

A stunning, privacy-preserving NFT auction system using Zama's Fully Homomorphic Encryption (FHE) technology with a modern, glass-morphism UI design.

**🎮 Interactive Learning** - Learn FHEVM technology through sealed-bid auction implementation with beautiful visualizations

## ✨ Features

- 🔐 **Real FHEVM Integration**: Using `@fhevm/solidity` and `@zama-fhe/relayer-sdk`
- 🗳️ **Sealed-Bid Auctions**: All bid amounts are encrypted using FHE
- 🎨 **NFT Management**: Create, mint, and manage NFTs
- 🔑 **Access Control**: Only NFT owners can create auctions
- 🌐 **Sepolia Testnet**: Configured and supports Sepolia deployment
- ⚡ **Modern Glass-Morphism UI**: Stunning interface with backdrop blur effects
- 🛡️ **Secure Bidding**: Prevents bid manipulation and ensures privacy
- 🎭 **Beautiful Animations**: Smooth transitions and hover effects
- 📱 **Responsive Design**: Works perfectly on all devices

## 🏗️ Project Structure

```
zama2/
├── example/                    # Smart contracts
│   ├── contracts/
│   │   ├── FHE.sol            # FHE library
│   │   ├── PrivacyAuctionNFT.sol # NFT contract
│   │   ├── PrivacyAuction.sol    # Auction contract
│   │   └── SepoliaConfig.sol     # Network config
│   ├── scripts/
│   │   ├── deploy-nft.js      # NFT deployment
│   │   ├── deploy-auction.js  # Auction deployment
│   │   └── update-addresses.js # Address management
│   ├── hardhat.config.cjs     # Hardhat configuration
│   └── package.json           # Contract dependencies
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── App.jsx            # Main React application
│   │   ├── fheClient.js       # FHEVM client wrapper
│   │   ├── config/
│   │   │   └── contracts.js    # Contract configuration
│   │   ├── index.js           # React entry point
│   │   └── index.css          # Tailwind CSS styles
│   └── package.json           # Frontend dependencies
├── package.json               # Project dependencies
└── README.md                  # Project documentation
```

## 🎨 UI Design Features

### Modern Glass-Morphism Design
- **Dark Theme**: Sleek dark background with gradient overlays
- **Glass Effects**: Backdrop blur and transparency for modern look
- **Gradient Buttons**: Beautiful gradient buttons with hover animations
- **Status Indicators**: Color-coded status badges with animations
- **Responsive Cards**: Grid layout that adapts to all screen sizes

### Interactive Elements
- **Hover Effects**: Smooth scale and shadow transitions
- **Loading States**: Animated spinners and skeleton screens
- **Status Animations**: Pulsing indicators for active states
- **Form Validation**: Real-time input validation with visual feedback

## 🚀 Quick Start

### Method 1: Deploy Real Contracts

#### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install example dependencies
cd example
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

#### 2. Configure Environment Variables

```bash
# Copy environment variable templates
cd example
cp env.example .env

# Edit .env files with your actual values
PRIVATE_KEY=0x1234567890abcdef...  # Your private key (64 hex chars)
SEPOLIA_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
ETHERSCAN_API_KEY=your_etherscan_api_key
```

#### 3. Validate Environment

```bash
# Validate your environment configuration
cd example
node scripts/validate-env.js
```

#### 4. Deploy Smart Contracts

```bash
# Compile contracts
npm run compile

# Deploy NFT contract
npm run deploy:nft

# Deploy auction contract
npm run deploy:auction

# Update address configuration
npm run addresses

# Verify contracts (optional)
npm run verify:all
```

#### 5. Start Frontend

```bash
npm run frontend:start
```

The application will open at `http://localhost:3000`.

## 📝 Usage

### 1. **Mint NFT**
- Connect your wallet
- Enter NFT metadata URI
- Click "Mint NFT"

### 2. **Create Auction**
- Select your NFT token ID
- Set reserve price and duration
- Click "Create Auction"

### 3. **Place Bid**
- Enter bid amount (must be >= reserve price)
- Click "Place Bid" (encrypted using FHEVM)

### 4. **Settle Auction**
- After auction ends, click "Settle Auction"
- Winner receives NFT, creator receives payment

## 🔐 Privacy Features

- **Encrypted Bidding**: All bid amounts are encrypted using FHE
- **Privacy Protection**: Bid amounts are completely invisible on-chain
- **Sealed-Bid System**: Bids remain secret until auction ends
- **Anti-Manipulation**: Prevents bid sniping and manipulation
- **Transparent Results**: Final results are revealed after auction ends

## 🛠️ Tech Stack

### Smart Contracts
- `@fhevm/solidity`: Zama FHE Solidity library
- `@openzeppelin/contracts`: OpenZeppelin NFT implementation
- `hardhat`: Ethereum development framework

### Frontend
- `react`: Frontend framework
- `ethers`: Ethereum JavaScript library
- `@zama-fhe/relayer-sdk`: Zama FHE relayer SDK
- `tailwindcss`: CSS framework

## 🔧 Development Tips

### Using Cursor IDE

1. Open the project in Cursor
2. Use `@docs` to load Zama documentation for inline guidance
3. Create `.cursorrules` file to ensure consistent code generation

### Development

```bash
# Build frontend
cd frontend && npm run build

# Clean build artifacts
cd example && npm run clean
```

## 🐛 Troubleshooting

### Common Issues

1. **MetaMask Connection**: Ensure connected to Sepolia testnet
2. **Contract Not Found**: Verify contract address in `.env`
3. **FHEVM Errors**: Check FHEVM client initialization
4. **Gas Fees**: Ensure sufficient Sepolia ETH
5. **NFT Ownership**: Verify you own the NFT before creating auction

### Getting Help

- Check Zama documentation: https://docs.zama.ai/
- Check official relayer SDK documentation
- Ensure all dependencies are properly installed

## 📄 License

MIT License - See LICENSE file for details.

## ⚠️ Disclaimer

This is a demonstration project. Use at your own risk, ensure proper security measures before any production deployment.


## 🙏 Acknowledgments

- Using [Zama FHEVM technology](https://github.com/zama-ai/fhevm)
- Based on [OpenZeppelin contracts](https://github.com/OpenZeppelin/openzeppelin-contracts)
- Inspired by sealed-bid auction research

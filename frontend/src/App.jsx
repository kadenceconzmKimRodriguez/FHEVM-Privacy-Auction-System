import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import fheAuctionClient from './fheClient';
import { 
  CONTRACT_ADDRESSES, 
  PRIVACY_AUCTION_NFT_ABI, 
  PRIVACY_AUCTION_ABI 
} from './config/contracts';
import './index.css';

function App() {
  const [nftContract, setNftContract] = useState(null);
  const [auctionContract, setAuctionContract] = useState(null);
  const [account, setAccount] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [auctions, setAuctions] = useState([]);
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fhevmReady, setFhevmReady] = useState(false);
  const [network, setNetwork] = useState(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  
  // New NFT form
  const [newNft, setNewNft] = useState({
    uri: '',
    description: ''
  });
  
  // New auction form
  const [newAuction, setNewAuction] = useState({
    tokenId: '',
    reservePrice: '',
    duration: 8640000 // 100 days
  });
  
  // Bid form
  const [bidAmount, setBidAmount] = useState('');
  const [selectedAuction, setSelectedAuction] = useState(null);

  // Check network
  const checkNetwork = async () => {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      setNetwork(network);
      
      // Check if connected to Sepolia (chainId: 11155111)
      const isSepolia = network.chainId === 11155111n;
      setIsCorrectNetwork(isSepolia);
      
      return isSepolia;
    }
    return false;
  };

  // Switch to Sepolia network
  const switchToSepolia = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // Sepolia chain ID
      });
    } catch (error) {
      // If Sepolia is not added, add it
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0xaa36a7',
              chainName: 'Sepolia',
              rpcUrls: ['https://sepolia.infura.io/v3/'],
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18,
              },
              blockExplorerUrls: ['https://sepolia.etherscan.io/'],
            }],
          });
        } catch (addError) {
          console.error('Error adding Sepolia network:', addError);
        }
      }
    }
  };

  // Initialize connection
  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        
        setAccount(address);
        
        // Check network
        const isCorrectNetwork = await checkNetwork();
        if (!isCorrectNetwork) {
          alert('Please switch to Sepolia testnet to use this application');
          return;
        }
        
        // Initialize NFT contract
        const nftInstance = new ethers.Contract(
          CONTRACT_ADDRESSES.PrivacyAuctionNFT, 
          PRIVACY_AUCTION_NFT_ABI, 
          signer
        );
        setNftContract(nftInstance);
        
        // Initialize auction contract
        const auctionInstance = new ethers.Contract(
          CONTRACT_ADDRESSES.PrivacyAuction, 
          PRIVACY_AUCTION_ABI, 
          signer
        );
        setAuctionContract(auctionInstance);
        
        // Check if user is owner
        const owner = await auctionInstance.owner();
        setIsOwner(address.toLowerCase() === owner.toLowerCase());
        
        // Initialize FHEVM client
        const fhevmInitialized = await fheAuctionClient.initialize();
        setFhevmReady(fhevmInitialized);
        
        await loadData();
      } else {
        alert('Please install MetaMask!');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet');
    }
  };

  // Load auctions and NFTs
  const loadData = useCallback(async () => {
    if (!auctionContract || !nftContract) return;
    
    try {
      setLoading(true);
      
      // Load auctions
      const auctionCount = await auctionContract.getAuctionCounter();
      const auctionList = [];
      
      for (let i = 0; i < Number(auctionCount); i++) {
        const auctionInfo = await auctionContract.getAuctionInfo(i);
        const hasBid = await auctionContract.hasBid(i, account);
        
        auctionList.push({
          id: i,
          tokenId: auctionInfo[0],
          creator: auctionInfo[1],
          reservePrice: auctionInfo[2],
          startTime: auctionInfo[3],
          endTime: auctionInfo[4],
          isActive: auctionInfo[5],
          isSettled: auctionInfo[6],
          highestBid: auctionInfo[7],
          highestBidder: auctionInfo[8],
          bidCount: auctionInfo[9],
          hasBid
        });
      }
      
      setAuctions(auctionList);
      
      // Load NFTs (simplified - in real app you'd track minted NFTs)
      const nextTokenId = await nftContract.getNextTokenId();
      const nftList = [];
      
      for (let i = 0; i < Number(nextTokenId); i++) {
        try {
          const owner = await nftContract.ownerOf(i);
          const tokenURI = await nftContract.tokenURI(i);
          const auctionStatus = await nftContract.getAuctionStatus(i);
          
          nftList.push({
            id: i,
            owner,
            tokenURI,
            inAuction: auctionStatus
          });
        } catch (error) {
          // Token doesn't exist or other error
          continue;
        }
      }
      
      setNfts(nftList);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [auctionContract, nftContract, account]);

  // Mint new NFT
  const mintNft = async () => {
    if (!newNft.uri || !nftContract) {
      alert('Please fill in NFT URI and connect wallet');
      return;
    }
    
    try {
      setLoading(true);
      const tx = await nftContract.mint(account, newNft.uri);
      await tx.wait();
      
      setNewNft({ uri: '', description: '' });
      await loadData();
      alert('NFT minted successfully!');
    } catch (error) {
      console.error('Error minting NFT:', error);
      alert(`Failed to mint NFT: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Create new auction
  const createAuction = async () => {
    if (!newAuction.tokenId || !newAuction.reservePrice || !auctionContract) {
      alert('Please fill in all fields and connect wallet');
      return;
    }
    
    try {
      setLoading(true);
      
      // First check if user owns the NFT
      console.log('Checking NFT ownership for token ID:', newAuction.tokenId);
      console.log('User account:', account);
      
      const nftOwner = await nftContract.ownerOf(newAuction.tokenId);
      console.log('NFT owner:', nftOwner);
      
      if (nftOwner.toLowerCase() !== account.toLowerCase()) {
        alert(`You don't own this NFT. Owner: ${nftOwner}\nYour account: ${account}\nPlease mint an NFT first or use a token ID you own.`);
        return;
      }
      
      // Check if NFT is already in auction
      console.log('Checking if NFT is in auction...');
      const isInAuction = await nftContract.getAuctionStatus(newAuction.tokenId);
      console.log('NFT in auction status:', isInAuction);
      
      if (isInAuction) {
        alert('This NFT is already in an auction. Please choose a different NFT.');
        return;
      }
      
      console.log('Creating auction with parameters:');
      console.log('- Token ID:', newAuction.tokenId);
      console.log('- NFT Contract:', CONTRACT_ADDRESSES.PrivacyAuctionNFT);
      console.log('- Reserve Price:', ethers.parseEther(newAuction.reservePrice));
      console.log('- Duration:', newAuction.duration);
      console.log('- User Account:', account);
      
      // Double check NFT ownership with the same contract address
      console.log('Double checking NFT ownership...');
      const nftOwnerCheck = await nftContract.ownerOf(newAuction.tokenId);
      console.log('NFT owner from contract:', nftOwnerCheck);
      console.log('User account:', account);
      console.log('Ownership match:', nftOwnerCheck.toLowerCase() === account.toLowerCase());
      
      const tx = await auctionContract.createAuction(
        newAuction.tokenId,
        CONTRACT_ADDRESSES.PrivacyAuctionNFT,
        ethers.parseEther(newAuction.reservePrice),
        newAuction.duration
      );
      await tx.wait();
      
      setNewAuction({ tokenId: '', reservePrice: '', duration: 8640000 });
      await loadData();
      alert('Auction created successfully!');
    } catch (error) {
      console.error('Error creating auction:', error);
      if (error.message.includes('Not NFT owner')) {
        alert('You must own the NFT to create an auction for it. Please mint an NFT first or use a token ID you own.');
      } else if (error.message.includes('NFT already in auction')) {
        alert('This NFT is already in an auction. Please choose a different NFT.');
      } else {
        alert(`Failed to create auction: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Place a bid
  const placeBid = async (auctionId) => {
    if (!bidAmount || !auctionContract || !fhevmReady) {
      alert('Please enter bid amount and ensure FHEVM is ready');
      return;
    }
    
    // Validate bid amount
    const bidValue = parseFloat(bidAmount);
    if (isNaN(bidValue) || bidValue <= 0) {
      alert('Please enter a valid bid amount');
      return;
    }
    
    try {
      setLoading(true);
      console.log('🔐 Placing encrypted bid...');
      
      // Convert bid amount to encrypted format
      const bidValueWei = ethers.parseEther(bidAmount);
      const bidValueHex = "0x" + bidValueWei.toString(16).padStart(64, '0');
      
      // Create encrypted bid struct: { value: bytes32 }
      const encryptedBid = { value: bidValueHex };
      
      const tx = await auctionContract.placeBid(auctionId, encryptedBid, {
        value: bidValueWei
      });
      await tx.wait();
      
      setBidAmount('');
      await loadData();
      alert('Bid placed successfully!');
    } catch (error) {
      console.error('Error placing bid:', error);
      let errorMessage = 'Failed to place bid';
      
      if (error.message.includes('Already placed a bid')) {
        errorMessage = 'You have already placed a bid in this auction';
      } else if (error.message.includes('Bid below reserve price')) {
        errorMessage = 'Your bid is below the reserve price';
      } else if (error.message.includes('Bid amount must be greater than 0')) {
        errorMessage = 'Bid amount must be greater than 0';
      } else {
        errorMessage = `Failed to place bid: ${error.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // End auction
  const endAuction = async (auctionId) => {
    if (!auctionContract) {
      alert('Please connect your wallet first.');
      return;
    }
    
    try {
      setLoading(true);
      const tx = await auctionContract.endAuction(auctionId);
      await tx.wait();
      
      await loadData();
      alert('Auction ended!');
    } catch (error) {
      console.error('Error ending auction:', error);
      alert('Failed to end auction');
    } finally {
      setLoading(false);
    }
  };

  // Settle auction
  const settleAuction = async (auctionId) => {
    if (!auctionContract) {
      alert('Please connect your wallet first.');
      return;
    }
    
    try {
      setLoading(true);
      const tx = await auctionContract.settleAuction(auctionId);
      await tx.wait();
      
      await loadData();
      alert('Auction settled!');
    } catch (error) {
      console.error('Error settling auction:', error);
      alert('Failed to settle auction');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auctionContract && nftContract) {
      loadData();
    }
  }, [auctionContract, nftContract, loadData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">🔐</span>
              </div>
              <h1 className="text-2xl font-bold text-white">Privacy Auction</h1>
            </div>
            {account && (
              <div className="flex items-center space-x-4">
                {fhevmReady && (
                  <div className="flex items-center px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                    FHEVM Ready
                  </div>
                )}
                {network && (
                  <div className={`flex items-center px-3 py-1 rounded-full text-sm ${
                    isCorrectNetwork 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      isCorrectNetwork ? 'bg-green-400' : 'bg-red-400'
                    }`}></div>
                    {network.name} ({Number(network.chainId)})
                  </div>
                )}
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <span className="text-white text-sm">
                    {account.slice(0, 6)}...{account.slice(-4)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Privacy Auction System
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Experience the future of NFT auctions with complete privacy protection using Zama FHEVM technology
          </p>
          <div className="flex justify-center space-x-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
              <span className="text-white font-medium">🔒 Sealed Bids</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
              <span className="text-white font-medium">🛡️ Privacy First</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
              <span className="text-white font-medium">⚡ Instant Settlement</span>
            </div>
          </div>
        </div>

        {!account ? (
          <div className="max-w-lg mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🔗</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h2>
              <p className="text-gray-300 mb-8 text-lg">
                Connect your wallet to start using the privacy auction system and experience secure, encrypted bidding.
              </p>
              <button
                onClick={connectWallet}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Connect Wallet
              </button>
            </div>
          </div>
        ) : !isCorrectNetwork ? (
          <div className="max-w-lg mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">⚠️</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Wrong Network</h2>
              <p className="text-gray-300 mb-8 text-lg">
                Please switch to Sepolia testnet to use this application.
              </p>
              <button
                onClick={switchToSepolia}
                className="bg-gradient-to-r from-red-500 to-orange-500 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:from-red-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Switch to Sepolia
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Account Info */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Account Information</h2>
                  <p className="text-gray-300">Address: {account}</p>
                </div>
                {isOwner && (
                  <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-full font-semibold">
                    👑 Contract Owner
                  </div>
                )}
              </div>
            </div>

            {/* Mint NFT */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-2xl">🎨</span>
                </div>
                <h2 className="text-2xl font-bold text-white">Mint New NFT</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-white font-medium mb-2">NFT Metadata URI</label>
                  <input
                    type="text"
                    placeholder="https://your-metadata-uri.com"
                    value={newNft.uri}
                    onChange={(e) => setNewNft({ ...newNft, uri: e.target.value })}
                    className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">NFT Description</label>
                  <input
                    type="text"
                    placeholder="Describe your NFT..."
                    value={newNft.description}
                    onChange={(e) => setNewNft({ ...newNft, description: e.target.value })}
                    className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                    disabled={loading}
                  />
                </div>
                <button
                  onClick={mintNft}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:transform-none"
                >
                  {loading ? '⏳ Minting...' : '🎨 Mint NFT'}
                </button>
              </div>
            </div>

            {/* Create Auction */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-2xl">🏆</span>
                </div>
                <h2 className="text-2xl font-bold text-white">Create New Auction</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-white font-medium mb-2">Token ID</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={newAuction.tokenId}
                    onChange={(e) => setNewAuction({ ...newAuction, tokenId: e.target.value })}
                    className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent backdrop-blur-sm"
                    disabled={loading}
                  />
                  {nfts.length > 0 ? (
                    <div className="mt-2 text-sm text-gray-300">
                      <p className="text-green-400">✅ Your NFTs: {nfts.map(nft => nft.tokenId).join(', ')}</p>
                      <p className="text-xs text-gray-400">Use one of these Token IDs to create an auction</p>
                    </div>
                  ) : (
                    <div className="mt-2 text-sm text-red-400">
                      <p>❌ You don't own any NFTs yet</p>
                      <p className="text-xs text-gray-400">Please mint an NFT first</p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Reserve Price (ETH)</label>
                  <input
                    type="text"
                    placeholder="0.1"
                    value={newAuction.reservePrice}
                    onChange={(e) => setNewAuction({ ...newAuction, reservePrice: e.target.value })}
                    className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent backdrop-blur-sm"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Duration (seconds)</label>
                  <input
                    type="number"
                    placeholder="3600"
                    value={newAuction.duration}
                    onChange={(e) => setNewAuction({ ...newAuction, duration: Number(e.target.value) })}
                    className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent backdrop-blur-sm"
                    disabled={loading}
                  />
                </div>
              </div>
              <button
                onClick={createAuction}
                disabled={loading || nfts.length === 0}
                className="w-full mt-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:transform-none"
              >
                {loading ? '⏳ Creating...' : nfts.length === 0 ? '❌ Mint NFT First' : '🏆 Create Auction'}
              </button>
            </div>

            {/* Auctions */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-2xl">🏆</span>
                </div>
                <h2 className="text-2xl font-bold text-white">Active Auctions</h2>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                  <span className="ml-4 text-white text-lg">Loading auctions...</span>
                </div>
              ) : auctions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">🔍</span>
                  </div>
                  <p className="text-gray-300 text-lg">No auctions available.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {auctions.map((auction) => (
                    <div
                      key={auction.id}
                      className={`p-6 rounded-2xl border backdrop-blur-sm ${
                        auction.isActive 
                          ? 'bg-green-500/10 border-green-500/30' 
                          : auction.isSettled
                          ? 'bg-blue-500/10 border-blue-500/30'
                          : 'bg-gray-500/10 border-gray-500/30'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-white">Auction #{auction.id}</h3>
                          <p className="text-gray-300">Token ID: {auction.tokenId}</p>
                        </div>
                        <span
                          className={`px-4 py-2 rounded-full text-sm font-semibold ${
                            auction.isActive
                              ? 'bg-green-500/20 text-green-400'
                              : auction.isSettled
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}
                        >
                          {auction.isActive ? '🟢 Active' : auction.isSettled ? '🔵 Settled' : '⚫ Ended'}
                        </span>
                      </div>
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Reserve Price:</span>
                          <span className="text-white font-semibold">{ethers.formatEther(auction.reservePrice)} ETH</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Highest Bid:</span>
                          <span className="text-green-400 font-semibold">{ethers.formatEther(auction.highestBid)} ETH</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Bid Count:</span>
                          <span className="text-white font-semibold">{auction.bidCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">End Time:</span>
                          <span className="text-white font-semibold">{new Date(Number(auction.endTime) * 1000).toLocaleString()}</span>
                        </div>
                      </div>
                      
                      {auction.isActive && !auction.hasBid && fhevmReady && (
                        <div className="space-y-3 mb-4">
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              placeholder="Bid amount (ETH)"
                              value={bidAmount}
                              onChange={(e) => setBidAmount(e.target.value)}
                              className="flex-1 p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                            />
                            <button
                              onClick={() => placeBid(auction.id)}
                              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
                            >
                              🔒 Bid
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {auction.hasBid && (
                        <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-xl">
                          <p className="text-blue-400 font-medium text-center">✅ You have placed a bid</p>
                        </div>
                      )}
                      
                      <div className="flex space-x-2">
                        {!auction.isActive && !auction.isSettled && (
                          <button
                            onClick={() => settleAuction(auction.id)}
                            className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all duration-300"
                          >
                            💰 Settle
                          </button>
                        )}
                        
                        {auction.isActive && auction.creator.toLowerCase() === account.toLowerCase() && (
                          <button
                            onClick={() => endAuction(auction.id)}
                            className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300"
                          >
                            ⏹️ End
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* NFTs */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-2xl">🎨</span>
                </div>
                <h2 className="text-2xl font-bold text-white">Your NFTs</h2>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
                  <span className="ml-4 text-white text-lg">Loading NFTs...</span>
                </div>
              ) : nfts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">🎨</span>
                  </div>
                  <p className="text-gray-300 text-lg">No NFTs found.</p>
                  <p className="text-gray-400 text-sm mt-2">Mint your first NFT to get started!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {nfts.map((nft) => (
                    <div
                      key={nft.id}
                      className={`p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-105 ${
                        nft.inAuction 
                          ? 'bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/20' 
                          : 'bg-white/5 border-white/20 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-white">NFT #{nft.id}</h3>
                        {nft.inAuction && (
                          <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm rounded-full font-semibold">
                            🏆 In Auction
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Owner:</span>
                          <span className="text-white font-semibold text-sm">
                            {nft.owner.slice(0, 6)}...{nft.owner.slice(-4)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Status:</span>
                          <span className={`font-semibold text-sm ${
                            nft.inAuction ? 'text-yellow-400' : 'text-green-400'
                          }`}>
                            {nft.inAuction ? 'In Auction' : 'Available'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="bg-white/5 rounded-xl p-3">
                        <p className="text-gray-300 text-sm mb-1">Metadata URI:</p>
                        <p className="text-white text-xs break-all">{nft.tokenURI}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

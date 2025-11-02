import React, { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";

const BlockchainContext = createContext();

export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (!context) {
    throw new Error("useBlockchain must be used within BlockchainProvider");
  }
  return context;
};

export const BlockchainProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [network, setNetwork] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Kiểm tra xem MetaMask có được cài đặt không
  const checkIfWalletIsConnected = async () => {
    try {
      if (!window.ethereum) {
        console.log("MetaMask is not installed");
        return false;
      }

      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });

      if (accounts.length > 0) {
        await connectWallet();
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error checking wallet connection:", error);
      return false;
    }
  };

  // Kết nối ví MetaMask
  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error("Vui lòng cài đặt MetaMask!");
      window.open("https://metamask.io/download/", "_blank");
      return false;
    }

    setIsConnecting(true);

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      // Create provider and signer
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const web3Signer = await web3Provider.getSigner();
      const web3Network = await web3Provider.getNetwork();

      setAccount(accounts[0]);
      setProvider(web3Provider);
      setSigner(web3Signer);
      setNetwork({
        name: web3Network.name,
        chainId: Number(web3Network.chainId),
      });
      setIsConnected(true);

      // Check if on Sepolia network, if not, prompt to switch
      const sepoliaChainId = 11155111;
      if (Number(web3Network.chainId) !== sepoliaChainId) {
        toast.error("Vui lòng chuyển sang Sepolia test network!");
        await switchToSepolia();
      } else {
        toast.success("Đã kết nối ví thành công!");
      }

      return true;
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast.error("Không thể kết nối ví");
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  // Switch to Sepolia network
  const switchToSepolia = async () => {
    if (!window.ethereum) return false;

    try {
      // Try to switch to Sepolia
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaa36a7" }], // Sepolia chainId in hex
      });

      toast.success("Đã chuyển sang Sepolia network!");

      // Reload network info
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const web3Network = await web3Provider.getNetwork();
      setNetwork({
        name: web3Network.name,
        chainId: Number(web3Network.chainId),
      });

      return true;
    } catch (error) {
      // If Sepolia is not added, add it
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0xaa36a7",
                chainName: "Sepolia Test Network",
                nativeCurrency: {
                  name: "Sepolia ETH",
                  symbol: "ETH",
                  decimals: 18,
                },
                rpcUrls: ["https://sepolia.infura.io/v3/"],
                blockExplorerUrls: ["https://sepolia.etherscan.io"],
              },
            ],
          });
          toast.success("Đã thêm và chuyển sang Sepolia network!");
          return true;
        } catch (addError) {
          console.error("Error adding Sepolia network:", addError);
          toast.error("Không thể thêm Sepolia network");
          return false;
        }
      }
      console.error("Error switching network:", error);
      toast.error("Không thể chuyển sang Sepolia network");
      return false;
    }
  };

  // Ngắt kết nối ví
  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setNetwork(null);
    setIsConnected(false);
    toast.success("Đã ngắt kết nối ví");
  };

  // Lấy balance của account
  const getBalance = async (address = account) => {
    if (!provider || !address) return "0";

    try {
      const balance = await provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error("Error getting balance:", error);
      return "0";
    }
  };

  // Format địa chỉ (hiển thị ngắn gọn)
  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  // Xem transaction trên explorer
  const viewTransactionOnExplorer = (txHash) => {
    if (!network) return;

    let explorerUrl = "https://etherscan.io";

    if (network.chainId === 11155111) {
      explorerUrl = "https://sepolia.etherscan.io";
    } else if (network.chainId === 31337) {
      toast.info("Local network - No explorer available");
      return;
    }

    window.open(`${explorerUrl}/tx/${txHash}`, "_blank");
  };

  // Xem contract trên explorer
  const viewContractOnExplorer = (contractAddress) => {
    if (!network) return;

    let explorerUrl = "https://etherscan.io";

    if (network.chainId === 11155111) {
      explorerUrl = "https://sepolia.etherscan.io";
    } else if (network.chainId === 31337) {
      toast.info("Local network - No explorer available");
      return;
    }

    window.open(`${explorerUrl}/address/${contractAddress}`, "_blank");
  };

  // Xem địa chỉ trên explorer
  const viewAddressOnExplorer = (address) => {
    if (!network) return;

    let explorerUrl = "https://etherscan.io";

    if (network.chainId === 11155111) {
      explorerUrl = "https://sepolia.etherscan.io";
    } else if (network.chainId === 31337) {
      toast.info("Local network - No explorer available");
      return;
    }

    window.open(`${explorerUrl}/address/${address}`, "_blank");
  };

  // Switch network
  const switchNetwork = async (targetChainId) => {
    if (!window.ethereum) return false;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: ethers.toQuantity(targetChainId) }],
      });
      return true;
    } catch (error) {
      // This error code indicates that the chain has not been added to MetaMask
      if (error.code === 4902) {
        toast.error("Network chưa được thêm vào MetaMask");
      } else {
        console.error("Error switching network:", error);
        toast.error("Không thể chuyển network");
      }
      return false;
    }
  };

  // Listen for account changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else if (accounts[0] !== account) {
        setAccount(accounts[0]);
        toast.info("Đã chuyển tài khoản");
      }
    };

    const handleChainChanged = () => {
      // Reload the page when chain changes
      window.location.reload();
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, [account]);

  // Check wallet connection on mount
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const value = {
    account,
    provider,
    signer,
    network,
    isConnecting,
    isConnected,
    connectWallet,
    disconnectWallet,
    switchToSepolia,
    getBalance,
    formatAddress,
    viewTransactionOnExplorer,
    viewContractOnExplorer,
    viewAddressOnExplorer,
    switchNetwork,
  };

  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  );
};

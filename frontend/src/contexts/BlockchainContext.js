import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
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
  const [balance, setBalance] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Ref to prevent multiple connection toasts
  const hasConnected = useRef(false);

  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setNetwork(null);
    setBalance(null);
    setIsConnected(false);
    hasConnected.current = false;
    toast.success("Đã ngắt kết nối ví");
  }, []);

  const getBalance = useCallback(async (address, web3Provider) => {
    if (!web3Provider || !address) return;
    try {
      const balanceWei = await web3Provider.getBalance(address);
      const balanceEther = ethers.formatEther(balanceWei);
      setBalance(balanceEther);
    } catch (error) {
      console.error("Error getting balance:", error);
      setBalance(null);
    }
  }, []);

  const switchToSepolia = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaa36a7" }],
      });
      return true;
    } catch (error) {
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
          return true;
        } catch (addError) {
          console.error("Error adding Sepolia network:", addError);
          toast.error("Không thể thêm Sepolia network");
          return false;
        }
      } else {
        console.error("Error switching network:", error);
        toast.error("Không thể chuyển sang Sepolia network");
        return false;
      }
    }
  }, []);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      toast.error("Vui lòng cài đặt MetaMask!");
      window.open("https://metamask.io/download/", "_blank");
      return;
    }

    setIsConnecting(true);
    try {
      // First, try to get accounts without requesting (check if already connected)
      let accounts = await window.ethereum.request({
        method: "eth_accounts",
      });

      // If no accounts, request connection
      if (accounts.length === 0) {
        accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
      }

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
      await getBalance(accounts[0], web3Provider);

      const sepoliaChainId = 11155111;
      if (Number(web3Network.chainId) !== sepoliaChainId) {
        toast.error("Vui lòng chuyển sang Sepolia test network!");
        await switchToSepolia();
      } else {
        if (!hasConnected.current) {
          toast.success("Đã kết nối ví thành công!");
          hasConnected.current = true;
        }
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);

      // Handle specific error cases
      if (error.code === -32002) {
        toast.error("Vui lòng mở MetaMask và chấp nhận yêu cầu kết nối!");
      } else if (error.code === 4001) {
        toast.error("Bạn đã từ chối kết nối ví");
      } else if (error.message?.includes("locked")) {
        toast.error(
          "MetaMask đang bị khóa. Vui lòng mở MetaMask và nhập mật khẩu!"
        );
      } else {
        toast.error("Không thể kết nối ví. Vui lòng mở MetaMask và thử lại!");
      }
    } finally {
      setIsConnecting(false);
    }
  }, [getBalance, switchToSepolia]);

  // Listen for account and chain changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        connectWallet(); // Re-connect to get new account info and balance
        toast("Đã chuyển tài khoản", { icon: "ℹ️" });
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [connectWallet, disconnectWallet]);

  // Check for existing connection on initial mount
  useEffect(() => {
    const checkForExistingConnection = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          await connectWallet();
        }
      }
    };
    checkForExistingConnection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  const viewTransactionOnExplorer = (txHash) => {
    if (!network) return;
    const explorerUrl =
      network.chainId === 11155111
        ? "https://sepolia.etherscan.io"
        : "https://etherscan.io";
    window.open(`${explorerUrl}/tx/${txHash}`, "_blank");
  };

  const viewContractOnExplorer = (contractAddress) => {
    if (!network) return;
    const explorerUrl =
      network.chainId === 11155111
        ? "https://sepolia.etherscan.io"
        : "https://etherscan.io";
    window.open(`${explorerUrl}/address/${contractAddress}`, "_blank");
  };

  const viewAddressOnExplorer = (address) => {
    if (!network) return;
    const explorerUrl =
      network.chainId === 11155111
        ? "https://sepolia.etherscan.io"
        : "https://etherscan.io";
    window.open(`${explorerUrl}/address/${address}`, "_blank");
  };

  const switchNetwork = async (targetChainId) => {
    if (!window.ethereum) return false;
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: ethers.toQuantity(targetChainId) }],
      });
      return true;
    } catch (error) {
      if (error.code === 4902) {
        toast.error("Network chưa được thêm vào MetaMask");
      } else {
        console.error("Error switching network:", error);
        toast.error("Không thể chuyển network");
      }
      return false;
    }
  };

  const value = {
    account,
    provider,
    signer,
    network,
    balance,
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

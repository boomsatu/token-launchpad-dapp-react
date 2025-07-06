import React, { useState, useEffect } from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { bsc, bscTestnet } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { injected, walletConnect } from 'wagmi/connectors';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useSwitchChain, useConnect, useDisconnect, useBalance } from 'wagmi';
import { parseEther, formatEther, parseUnits, formatUnits } from 'viem';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import cryptoHero from '@/assets/crypto-hero.jpg';
import { 
  Wallet, 
  Timer, 
  Coins, 
  TrendingUp, 
  Copy, 
  ExternalLink,
  Loader2,
  AlertCircle,
  CheckCircle,
  Shield,
  Zap,
  Users,
  ArrowRight,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Konfigurasi kontrak
const SALE_CONTRACT_ADDRESS = "0xBc8829bc74799B374932D5391836Fc9a1870245a";
const PROJECT_TOKEN_ADDRESS = "0xb46B161d67889cA2172E3f6b3DAA024D9be3f3F3";
const USDT_ADDRESS = "0x9D4aee992DBe30c26AB883E4E8E269111813767d";

// ABI untuk kontrak penjualan
const SALE_ABI = [
  {
    "type": "function",
    "name": "buyWithBNB",
    "inputs": [
      { "name": "_referrer", "type": "address", "internalType": "address" }
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "buyWithUSDT",
    "inputs": [
      { "name": "_usdtAmount", "type": "uint256", "internalType": "uint256" },
      { "name": "_referrer", "type": "address", "internalType": "address" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "endTime",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "tokenPriceBNB",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "tokenPriceUSDT",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "totalTokensSold",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "paused",
    "inputs": [],
    "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
    "stateMutability": "view"
  }
];

// ABI untuk ERC20
const ERC20_ABI = [
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [{"name": "_spender", "type": "address"}, {"name": "_value", "type": "uint256"}],
    "name": "approve",
    "outputs": [{"name": "", "type": "bool"}],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}, {"name": "_spender", "type": "address"}],
    "name": "allowance",
    "outputs": [{"name": "", "type": "uint256"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }
];

// Konfigurasi Wagmi
const config = createConfig({
  chains: [bsc, bscTestnet],
  connectors: [
    injected(),
    walletConnect({
      projectId: '2f5a2a1a4e8b9c3d7f1e6a8b4c2d5e3f',
    }),
  ],
  transports: {
    [bsc.id]: http(),
    [bscTestnet.id]: http(),
  },
});

const queryClient = new QueryClient();

// Komponen utama
const TokenSaleDApp = () => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
            className="z-50"
          />
          <MainContent />
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

// Konten utama
const MainContent = () => {
  const { address, isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const isWrongNetwork = chain && ![56, 97].includes(chain.id);

  return (
    <div className="relative">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse-glow delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-pulse-glow delay-2000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header Modern - Mobile Optimized */}
        <header className="mb-8 md:mb-16 text-center animate-fade-in">
          <div className="relative overflow-hidden rounded-2xl md:rounded-3xl mb-6 md:mb-8">
            {/* Hero Background dengan Overlay */}
            <div className="absolute inset-0">
              <img 
                src={cryptoHero} 
                alt="Crypto Hero" 
                className="w-full h-full object-cover opacity-30"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/70 to-transparent"></div>
            </div>
            
            <div className="relative z-10 glass-card p-6 md:p-16">
              <div className="animate-float">
                <h1 className="text-4xl md:text-7xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4 md:mb-8 leading-tight">
                  🚀 Token Sale DApp
                </h1>
              </div>
              <p className="text-lg md:text-3xl text-foreground/90 mb-3 md:mb-6 font-medium px-2">
                Platform Penjualan Token Terdepan
              </p>
              <p className="text-sm md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-6 md:mb-8 px-4">
                Bergabunglah dengan revolusi crypto! Interface yang aman dan mudah digunakan 
                untuk membeli token dengan BNB atau USDT di Binance Smart Chain.
              </p>
              
              {/* Stats Bar - Mobile Responsive */}
              <div className="flex justify-center items-center gap-4 md:gap-8 mb-6 md:mb-8">
                <div className="text-center">
                  <div className="text-lg md:text-2xl font-bold text-primary">24/7</div>
                  <div className="text-xs md:text-sm text-muted-foreground">Support</div>
                </div>
                <div className="text-center">
                  <div className="text-lg md:text-2xl font-bold text-secondary">100%</div>
                  <div className="text-xs md:text-sm text-muted-foreground">Aman</div>
                </div>
                <div className="text-center">
                  <div className="text-lg md:text-2xl font-bold text-accent">Instant</div>
                  <div className="text-xs md:text-sm text-muted-foreground">Transfer</div>
                </div>
              </div>
            </div>
          </div>
          <ConnectWallet />
        </header>

        {/* Feature Cards untuk non-connected users - Mobile Responsive */}
        {!isConnected && (
          <div className="max-w-6xl mx-auto mb-8 md:mb-16 animate-fade-in delay-300 px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
              <FeatureCard 
                icon={<Shield className="w-8 h-8 md:w-12 md:h-12 text-primary" />}
                title="Keamanan Terjamin"
                description="Smart contract yang telah diaudit dan sistem enkripsi tingkat bank"
                delay="0"
              />
              <FeatureCard 
                icon={<Zap className="w-8 h-8 md:w-12 md:h-12 text-secondary" />}
                title="Transaksi Instan"
                description="Proses pembelian token yang cepat dengan konfirmasi real-time"
                delay="100"
              />
              <FeatureCard 
                icon={<Users className="w-8 h-8 md:w-12 md:h-12 text-accent" />}
                title="Sistem Referral"
                description="Dapatkan bonus untuk setiap referral yang berhasil"
                delay="200"
              />
            </div>
          </div>
        )}

        {/* Konten untuk wallet yang terhubung - Mobile Responsive */}
        {isConnected && !isWrongNetwork && (
          <div className="animate-fade-in px-4">
            {/* Sale Status */}
            <div className="mb-8 md:mb-12">
              <SaleStatus />
            </div>
            
            {/* Purchase Panels - Mobile Stack Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto">
              <div className="lg:col-span-1">
                <BuyWithBNB />
              </div>
              <div className="lg:col-span-1">
                <BuyWithUSDT />
              </div>
              <div className="xl:col-span-1 lg:col-span-2 xl:col-start-auto lg:col-start-1">
                <UserBalances />
              </div>
            </div>
          </div>
        )}

        {/* Wrong Network Warning */}
        {isConnected && isWrongNetwork && (
          <Card className="card-glow max-w-md mx-auto animate-scale-in">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-20 h-20 text-warning mx-auto mb-6 animate-pulse" />
              <h3 className="text-2xl font-bold mb-4">Jaringan Salah</h3>
              <p className="text-muted-foreground mb-8 text-lg">
                Silakan hubungkan ke Binance Smart Chain untuk melanjutkan
              </p>
              <Button 
                onClick={() => switchChain({ chainId: 56 })}
                className="w-full text-lg py-6"
                size="lg"
              >
                <ArrowRight className="w-5 h-5 mr-2" />
                Ganti ke BSC
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

// Feature Card Component - Mobile Optimized
const FeatureCard = ({ icon, title, description, delay }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: string;
}) => (
  <Card className={`card-glow hover:scale-105 transition-all duration-300 animate-fade-in`} 
        style={{ animationDelay: `${delay}ms` }}>
    <CardContent className="p-4 md:p-8 text-center">
      <div className="mb-4 md:mb-6 flex justify-center animate-float">
        {icon}
      </div>
      <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-4">{title}</h3>
      <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{description}</p>
    </CardContent>
  </Card>
);

// Komponen Connect Wallet yang diperbaiki
const ConnectWallet = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });

  // Filter hanya connector yang tersedia
  const availableConnectors = connectors.filter(connector => connector.name !== 'WalletConnect' || connector.id === 'walletConnect');

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center gap-4 md:gap-6">
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 md:gap-4 justify-center w-full max-w-md sm:max-w-none">
          {availableConnectors.map((connector) => (
            <Button
              key={connector.uid}
              onClick={() => connect({ connector })}
              disabled={isPending}
              size="lg"
              className="bg-gradient-primary hover:shadow-button transition-all duration-300 text-base md:text-lg px-6 md:px-8 py-3 md:py-4 hover:scale-105 w-full sm:w-auto"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 md:w-5 md:h-5 mr-2 animate-spin" />
              ) : (
                <Wallet className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              )}
              Hubungkan {connector.name}
            </Button>
          ))}
        </div>
        <p className="text-xs md:text-sm text-muted-foreground text-center px-4">
          Hubungkan wallet Anda untuk mulai membeli token
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 animate-scale-in">
      <div className="glass-card rounded-2xl p-4 md:p-6 flex flex-col sm:flex-row items-center gap-3 md:gap-4 w-full sm:w-auto">
        <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start">
          <div className="w-3 h-3 md:w-4 md:h-4 bg-success rounded-full animate-pulse"></div>
          <div className="text-center sm:text-left">
            <div className="font-mono text-base md:text-lg font-semibold">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </div>
            {balance && (
              <div className="text-xs md:text-sm text-muted-foreground">
                {parseFloat(balance.formatted).toFixed(4)} BNB
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto justify-center">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigator.clipboard.writeText(address || '')}
            className="hover:bg-primary/20 flex-1 sm:flex-none"
          >
            <Copy className="w-3 h-3 md:w-4 md:h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => disconnect()}
            className="hover:bg-destructive/20 hover:text-destructive hover:border-destructive flex-1 sm:flex-none"
          >
            <X className="w-3 h-3 md:w-4 md:h-4 mr-1" />
            <span className="hidden sm:inline">Keluar</span>
            <span className="sm:hidden">Keluar</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

// Sale Status dengan design yang diperbaiki
const SaleStatus = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const { data: endTime } = useReadContract({
    address: SALE_CONTRACT_ADDRESS as `0x${string}`,
    abi: SALE_ABI,
    functionName: 'endTime',
  });

  const { data: totalSold } = useReadContract({
    address: SALE_CONTRACT_ADDRESS as `0x${string}`,
    abi: SALE_ABI,
    functionName: 'totalTokensSold',
  });

  const { data: isPaused } = useReadContract({
    address: SALE_CONTRACT_ADDRESS as `0x${string}`,
    abi: SALE_ABI,
    functionName: 'paused',
  });

  useEffect(() => {
    if (!endTime) return;

    const timer = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const difference = Number(endTime) - now;

      if (difference > 0) {
        const days = Math.floor(difference / (24 * 60 * 60));
        const hours = Math.floor((difference % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((difference % (60 * 60)) / 60);
        const seconds = difference % 60;
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <Card className="card-glow animate-fade-in">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-3 text-2xl">
          <TrendingUp className="w-8 h-8 text-primary animate-pulse" />
          Status Penjualan Token
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {/* Countdown Timer - Mobile Optimized */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3 md:mb-4">
              <Timer className="w-5 h-5 md:w-6 md:h-6 text-accent" />
              <span className="text-sm md:text-lg font-semibold text-muted-foreground">Berakhir dalam:</span>
            </div>
            <div className="flex justify-center gap-2 md:gap-3">
              {[
                { label: 'Hari', value: timeLeft.days },
                { label: 'Jam', value: timeLeft.hours },
                { label: 'Menit', value: timeLeft.minutes },
                { label: 'Detik', value: timeLeft.seconds }
              ].map((item, index) => (
                <div key={index} className="glass-card rounded-lg md:rounded-xl p-2 md:p-4 min-w-[50px] md:min-w-[70px] animate-pulse-glow">
                  <div className="text-xl md:text-3xl font-bold text-primary mb-0 md:mb-1">{item.value}</div>
                  <div className="text-xs font-medium text-muted-foreground">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Total Terjual - Mobile Optimized */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3 md:mb-4">
              <Coins className="w-5 h-5 md:w-6 md:h-6 text-secondary" />
              <span className="text-sm md:text-lg font-semibold text-muted-foreground">Total Terjual:</span>
            </div>
            <div className="glass-card rounded-lg md:rounded-xl p-4 md:p-6">
              <div className="text-2xl md:text-3xl font-bold text-secondary mb-1 md:mb-2">
                {totalSold ? formatEther(totalSold as bigint).slice(0, 10) : '0'}
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">Token</div>
            </div>
          </div>

          {/* Status - Mobile Optimized */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3 md:mb-4">
              <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-success" />
              <span className="text-sm md:text-lg font-semibold text-muted-foreground">Status:</span>
            </div>
            <div className="glass-card rounded-lg md:rounded-xl p-4 md:p-6">
              <div className={`text-xl md:text-2xl font-bold mb-1 md:mb-2 ${isPaused ? 'text-warning' : 'text-success'}`}>
                {isPaused ? '⏸️ Dijeda' : '🟢 Aktif'}
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">Penjualan</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Buy with BNB dengan design yang diperbaiki
const BuyWithBNB = () => {
  const [bnbAmount, setBnbAmount] = useState('');
  const [referrer, setReferrer] = useState('');
  const { address, chain } = useAccount();
  const { writeContract, data: hash, isPending } = useWriteContract();

  const { data: priceBNB } = useReadContract({
    address: SALE_CONTRACT_ADDRESS as `0x${string}`,
    abi: SALE_ABI,
    functionName: 'tokenPriceBNB',
  });

  const { isSuccess } = useWaitForTransactionReceipt({ hash });

  const estimatedTokens = bnbAmount && priceBNB ? 
    (parseFloat(bnbAmount) / (Number(priceBNB as bigint) / 1e18)).toFixed(4) : '0';

  const handleBuy = () => {
    if (!bnbAmount) {
      toast.error('Masukkan jumlah BNB yang valid');
      return;
    }

    const referrerAddress = referrer || '0x0000000000000000000000000000000000000000';

    writeContract({
      address: SALE_CONTRACT_ADDRESS as `0x${string}`,
      abi: SALE_ABI,
      functionName: 'buyWithBNB',
      args: [referrerAddress as `0x${string}`],
      value: parseEther(bnbAmount),
      account: address,
      chain: chain,
    });

    toast.info('Transaksi sedang diproses...');
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success('🎉 Pembelian berhasil!');
      setBnbAmount('');
      setReferrer('');
    }
  }, [isSuccess]);

  return (
    <Card className="card-glow animate-fade-in">
      <CardHeader className="text-center pb-4 md:pb-6">
        <CardTitle className="text-lg md:text-xl flex items-center justify-center gap-2">
          <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-primary rounded-full flex items-center justify-center">
            💰
          </div>
          Beli dengan BNB
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Jumlah BNB</label>
          <Input
            type="number"
            placeholder="0.0"
            value={bnbAmount}
            onChange={(e) => setBnbAmount(e.target.value)}
            className="text-base md:text-lg h-10 md:h-12 bg-input/50 backdrop-blur-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Alamat Referral <span className="text-xs">(opsional)</span>
          </label>
          <Input
            placeholder="0x..."
            value={referrer}
            onChange={(e) => setReferrer(e.target.value)}
            className="h-10 md:h-12 bg-input/50 backdrop-blur-sm font-mono text-xs md:text-sm"
          />
        </div>

        <div className="glass-card rounded-lg md:rounded-xl p-3 md:p-4 bg-primary/5">
          <div className="flex justify-between items-center">
            <span className="text-xs md:text-sm text-muted-foreground">Token yang diterima:</span>
            <span className="text-lg md:text-xl font-bold text-primary">{estimatedTokens}</span>
          </div>
        </div>

        <Button
          onClick={handleBuy}
          disabled={isPending || !bnbAmount}
          className="w-full bg-gradient-primary hover:shadow-button text-base md:text-lg py-4 md:py-6 transition-all duration-300"
          size="lg"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 md:w-5 md:h-5 mr-2 animate-spin" />
              <span className="text-sm md:text-base">Memproses...</span>
            </>
          ) : (
            <>
              <Wallet className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              <span className="text-sm md:text-base">Beli dengan BNB</span>
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

// Buy with USDT dengan design yang diperbaiki
const BuyWithUSDT = () => {
  const [usdtAmount, setUsdtAmount] = useState('');
  const [referrer, setReferrer] = useState('');
  const { address, chain } = useAccount();
  const { writeContract, data: hash, isPending } = useWriteContract();

  const { data: usdtAllowance } = useReadContract({
    address: USDT_ADDRESS as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [address, SALE_CONTRACT_ADDRESS],
  });

  const { data: priceUSDT } = useReadContract({
    address: SALE_CONTRACT_ADDRESS as `0x${string}`,
    abi: SALE_ABI,
    functionName: 'tokenPriceUSDT',
  });

  const { isSuccess } = useWaitForTransactionReceipt({ hash });

  const needsApproval = usdtAmount && usdtAllowance ? 
    parseUnits(usdtAmount, 18) > (usdtAllowance as bigint) : true;

  const estimatedTokens = usdtAmount && priceUSDT ? 
    (parseFloat(usdtAmount) / (Number(priceUSDT as bigint) / 1e18)).toFixed(4) : '0';

  const handleApprove = () => {
    if (!usdtAmount) return;

    writeContract({
      address: USDT_ADDRESS as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [SALE_CONTRACT_ADDRESS, parseUnits(usdtAmount, 18)],
      account: address,
      chain: chain,
    });

    toast.info('Menyetujui penggunaan USDT...');
  };

  const handleBuy = () => {
    if (!usdtAmount) {
      toast.error('Masukkan jumlah USDT yang valid');
      return;
    }

    const referrerAddress = referrer || '0x0000000000000000000000000000000000000000';

    writeContract({
      address: SALE_CONTRACT_ADDRESS as `0x${string}`,
      abi: SALE_ABI,
      functionName: 'buyWithUSDT',
      args: [parseUnits(usdtAmount, 18), referrerAddress as `0x${string}`],
      account: address,
      chain: chain,
    });

    toast.info('Transaksi sedang diproses...');
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(needsApproval ? '✅ Persetujuan berhasil!' : '🎉 Pembelian berhasil!');
      if (!needsApproval) {
        setUsdtAmount('');
        setReferrer('');
      }
    }
  }, [isSuccess, needsApproval]);

  return (
    <Card className="card-glow animate-fade-in delay-100">
      <CardHeader className="text-center pb-4 md:pb-6">
        <CardTitle className="text-lg md:text-xl flex items-center justify-center gap-2">
          <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-accent rounded-full flex items-center justify-center">
            💵
          </div>
          Beli dengan USDT
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Jumlah USDT</label>
          <Input
            type="number"
            placeholder="0.0"
            value={usdtAmount}
            onChange={(e) => setUsdtAmount(e.target.value)}
            className="text-base md:text-lg h-10 md:h-12 bg-input/50 backdrop-blur-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Alamat Referral <span className="text-xs">(opsional)</span>
          </label>
          <Input
            placeholder="0x..."
            value={referrer}
            onChange={(e) => setReferrer(e.target.value)}
            className="h-10 md:h-12 bg-input/50 backdrop-blur-sm font-mono text-xs md:text-sm"
          />
        </div>

        <div className="glass-card rounded-lg md:rounded-xl p-3 md:p-4 bg-secondary/5">
          <div className="flex justify-between items-center">
            <span className="text-xs md:text-sm text-muted-foreground">Token yang diterima:</span>
            <span className="text-lg md:text-xl font-bold text-secondary">{estimatedTokens}</span>
          </div>
        </div>

        {needsApproval ? (
          <Button
            onClick={handleApprove}
            disabled={isPending || !usdtAmount}
            className="w-full bg-gradient-accent hover:shadow-button text-base md:text-lg py-4 md:py-6 transition-all duration-300"
            size="lg"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 md:w-5 md:h-5 mr-2 animate-spin" />
                <span className="text-sm md:text-base">Menyetujui...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                <span className="text-sm md:text-base">Setujui USDT</span>
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={handleBuy}
            disabled={isPending || !usdtAmount}
            className="w-full bg-gradient-accent hover:shadow-button text-base md:text-lg py-4 md:py-6 transition-all duration-300"
            size="lg"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 md:w-5 md:h-5 mr-2 animate-spin" />
                <span className="text-sm md:text-base">Memproses...</span>
              </>
            ) : (
              <>
                <Coins className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                <span className="text-sm md:text-base">Beli dengan USDT</span>
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

// User Balances dengan design yang diperbaiki
const UserBalances = () => {
  const { address } = useAccount();

  const { data: projectTokenBalance } = useReadContract({
    address: PROJECT_TOKEN_ADDRESS as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address],
  });

  const { data: usdtBalance } = useReadContract({
    address: USDT_ADDRESS as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address],
  });

  const { data: bnbBalance } = useBalance({ address });

  return (
    <Card className="card-glow animate-fade-in delay-200">
      <CardHeader className="text-center pb-4 md:pb-6">
        <CardTitle className="text-lg md:text-xl flex items-center justify-center gap-2">
          <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-primary rounded-full flex items-center justify-center">
            👛
          </div>
          Saldo Wallet Anda
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6">
        <div className="grid gap-3 md:gap-4">
          {/* Project Token Balance */}
          <div className="glass-card rounded-lg md:rounded-xl p-3 md:p-4 bg-primary/5">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-xs md:text-sm text-muted-foreground">Project Token</div>
                <div className="text-lg md:text-2xl font-bold text-primary">
                  {projectTokenBalance ? formatEther(projectTokenBalance as bigint).slice(0, 10) : '0'}
                </div>
              </div>
              <Coins className="w-6 h-6 md:w-8 md:h-8 text-primary opacity-50" />
            </div>
          </div>

          {/* USDT Balance */}
          <div className="glass-card rounded-lg md:rounded-xl p-3 md:p-4 bg-accent/5">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-xs md:text-sm text-muted-foreground">USDT</div>
                <div className="text-lg md:text-2xl font-bold text-accent">
                  {usdtBalance ? formatUnits(usdtBalance as bigint, 18).slice(0, 10) : '0'}
                </div>
              </div>
              <div className="text-xl md:text-2xl">💵</div>
            </div>
          </div>

          {/* BNB Balance */}
          <div className="glass-card rounded-lg md:rounded-xl p-3 md:p-4 bg-secondary/5">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-xs md:text-sm text-muted-foreground">BNB</div>
                <div className="text-lg md:text-2xl font-bold text-secondary">
                  {bnbBalance ? parseFloat(bnbBalance.formatted).toFixed(4) : '0'}
                </div>
              </div>
              <div className="text-xl md:text-2xl">💰</div>
            </div>
          </div>
        </div>

        <Button
          onClick={() => window.open(`https://bscscan.com/address/${address}`, '_blank')}
          variant="outline"
          className="w-full hover:bg-primary/10 transition-all duration-300 py-3 md:py-4"
        >
          <ExternalLink className="w-3 h-3 md:w-4 md:h-4 mr-2" />
          <span className="text-sm md:text-base">Lihat di BSCScan</span>
        </Button>
      </CardContent>
    </Card>
  );
};

export default TokenSaleDApp;
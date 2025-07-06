import React, { useState, useEffect } from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { bsc, bscTestnet } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { injected, walletConnect } from 'wagmi/connectors';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useSwitchChain, useConnect, useDisconnect } from 'wagmi';
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
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Konfigurasi kontrak
const SALE_CONTRACT_ADDRESS = "0xBc8829bc74799B374932D5391836Fc9a1870245a";
const PROJECT_TOKEN_ADDRESS = "0xb46B161d67889cA2172E3f6b3DAA024D9be3f3F3";
const USDT_ADDRESS = "0x9D4aee992DBe30c26AB883E4E8E269111813767d";

// ABI pour le contrat de vente
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

// ABI pour ERC20 (USDT et Token du projet)
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

// Configuration Wagmi
const config = createConfig({
  chains: [bsc, bscTestnet],
  connectors: [
    injected(),
    walletConnect({
      projectId: 'demo-project-id', // Remplacer par votre propre WalletConnect Project ID
    }),
  ],
  transports: {
    [bsc.id]: http(),
    [bscTestnet.id]: http(),
  },
});

const queryClient = new QueryClient();

// Composant principal
const TokenSaleDApp = () => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-gradient-to-br from-background to-card">
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
          />
          <MainContent />
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

// Contenu principal
const MainContent = () => {
  const { address, isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const isWrongNetwork = chain && ![56, 97].includes(chain.id);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <header className="mb-12 text-center relative">
        {/* Hero Background */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden">
          <img 
            src={cryptoHero} 
            alt="Crypto Hero" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80"></div>
        </div>
        
        <div className="glass rounded-2xl p-12 mb-8 relative z-10">
          <h1 className="text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-6">
            Penjualan Token DApp
          </h1>
          <p className="text-2xl text-muted-foreground mb-4">
            Beli token Anda di Binance Smart Chain
          </p>
          <p className="text-lg text-muted-foreground/80 max-w-2xl mx-auto">
            Interface modern dan aman untuk berpartisipasi dalam penjualan token. 
            Hubungkan wallet Anda dan mulai berinvestasi hari ini.
          </p>
        </div>
        <ConnectWallet />
      </header>

      {/* Message pour wallet non connecté */}
      {!isConnected && (
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="card-glow text-center">
              <CardContent className="p-8">
                <Wallet className="w-16 h-16 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Hubungkan Wallet Anda</h3>
                <p className="text-muted-foreground">
                  Gunakan MetaMask atau Trust Wallet untuk terhubung ke BSC
                </p>
              </CardContent>
            </Card>
            
            <Card className="card-glow text-center">
              <CardContent className="p-8">
                <Coins className="w-16 h-16 text-secondary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Achetez des Tokens</h3>
                <p className="text-muted-foreground">
                  Payez avec BNB ou USDT pour recevoir vos tokens instantanément
                </p>
              </CardContent>
            </Card>
            
            <Card className="card-glow text-center">
              <CardContent className="p-8">
                <TrendingUp className="w-16 h-16 text-accent mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Sistem Referral</h3>
                <p className="text-muted-foreground">
                  Undang teman Anda dan dapatkan bonus untuk setiap pembelian
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Contenu principal si connecté et sur le bon réseau */}
      {isConnected && !isWrongNetwork && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Statut de la vente */}
          <div className="lg:col-span-3">
            <SaleStatus />
          </div>
          
          {/* Panels d'achat */}
          <div className="lg:col-span-1">
            <BuyWithBNB />
          </div>
          <div className="lg:col-span-1">
            <BuyWithUSDT />
          </div>
          <div className="lg:col-span-1">
            <UserBalances />
          </div>
        </div>
      )}

      {/* Message pour mauvais réseau */}
      {isConnected && isWrongNetwork && (
        <Card className="card-glow max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-warning mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-4">Jaringan Salah</h3>
            <p className="text-muted-foreground mb-6">
              Silakan hubungkan ke Binance Smart Chain
            </p>
            <Button 
              onClick={() => switchChain({ chainId: 56 })}
              className="w-full"
              variant="secondary"
            >
              Ganti ke BSC
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Composant ConnectWallet
const ConnectWallet = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  if (!isConnected) {
    return (
      <div className="flex gap-2 justify-center">
        {connectors.map((connector) => (
          <Button
            key={connector.uid}
            onClick={() => connect({ connector })}
            size="lg"
            className="bg-gradient-primary hover:shadow-glow transition-all"
          >
            <Wallet className="w-5 h-5 mr-2" />
            Connecter {connector.name}
          </Button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-4">
      <div className="glass rounded-lg p-4 flex items-center gap-3">
        <div className="w-3 h-3 bg-success rounded-full"></div>
        <span className="font-mono">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => navigator.clipboard.writeText(address || '')}
        >
          <Copy className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => disconnect()}
        >
          Déconnecter
        </Button>
      </div>
    </div>
  );
};

// Composant SaleStatus
const SaleStatus = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Lecture des données du contrat
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

  // Countdown timer
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
    <Card className="card-glow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary" />
          Statut de la Vente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Countdown */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Timer className="w-5 h-5 text-accent" />
              <span className="text-sm text-muted-foreground">Fin dans:</span>
            </div>
            <div className="flex justify-center gap-2">
              {[
                { label: 'J', value: timeLeft.days },
                { label: 'H', value: timeLeft.hours },
                { label: 'M', value: timeLeft.minutes },
                { label: 'S', value: timeLeft.seconds }
              ].map((item, index) => (
                <div key={index} className="glass rounded-lg p-2 min-w-[50px]">
                  <div className="text-xl font-bold text-primary">{item.value}</div>
                  <div className="text-xs text-muted-foreground">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Total vendu */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Coins className="w-5 h-5 text-secondary" />
              <span className="text-sm text-muted-foreground">Total Vendu:</span>
            </div>
            <div className="text-2xl font-bold text-secondary">
              {totalSold ? formatEther(totalSold as bigint).slice(0, 10) : '0'} Tokens
            </div>
          </div>

          {/* Statut */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-success" />
              <span className="text-sm text-muted-foreground">Statut:</span>
            </div>
            <div className={`text-lg font-semibold ${isPaused ? 'text-warning' : 'text-success'}`}>
              {isPaused ? 'En Pause' : 'Actif'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Composant BuyWithBNB
const BuyWithBNB = () => {
  const [bnbAmount, setBnbAmount] = useState('');
  const [referrer, setReferrer] = useState('');
  const { address, chain } = useAccount();
  const { writeContract, data: hash, isPending } = useWriteContract();

  // Lecture du prix en BNB
  const { data: priceBNB } = useReadContract({
    address: SALE_CONTRACT_ADDRESS as `0x${string}`,
    abi: SALE_ABI,
    functionName: 'tokenPriceBNB',
  });

  // Attendre la confirmation de transaction
  const { isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Calculer les tokens estimés
  const estimatedTokens = bnbAmount && priceBNB ? 
    (parseFloat(bnbAmount) / (Number(priceBNB as bigint) / 1e18)).toFixed(4) : '0';

  const handleBuy = () => {
    if (!bnbAmount) {
      toast.error('Veuillez entrer un montant BNB');
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

    toast.info('Transaction envoyée...');
  };

  // Effet pour les notifications de succès/erreur
  useEffect(() => {
    if (isSuccess) {
      toast.success('Achat réussi!');
      setBnbAmount('');
    }
  }, [isSuccess]);

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle className="text-center">Acheter avec BNB</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm text-muted-foreground">Montant BNB</label>
          <Input
            type="number"
            placeholder="0.0"
            value={bnbAmount}
            onChange={(e) => setBnbAmount(e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-sm text-muted-foreground">Référent (optionnel)</label>
          <Input
            placeholder="0x..."
            value={referrer}
            onChange={(e) => setReferrer(e.target.value)}
            className="mt-1"
          />
        </div>

        <div className="glass rounded-lg p-3">
          <div className="text-sm text-muted-foreground">Tokens estimés:</div>
          <div className="text-lg font-semibold text-primary">{estimatedTokens}</div>
        </div>

        <Button
          onClick={handleBuy}
          disabled={isPending || !bnbAmount}
          className="w-full bg-gradient-primary hover:shadow-button"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Transaction...
            </>
          ) : (
            'Acheter avec BNB'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

// Composant BuyWithUSDT
const BuyWithUSDT = () => {
  const [usdtAmount, setUsdtAmount] = useState('');
  const [referrer, setReferrer] = useState('');
  const { address, chain } = useAccount();
  const { writeContract, data: hash, isPending } = useWriteContract();

  // Lecture des données USDT
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

  const { isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

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

    toast.info('Approbation en cours...');
  };

  const handleBuy = () => {
    if (!usdtAmount) {
      toast.error('Veuillez entrer un montant USDT');
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

    toast.info('Transaction envoyée...');
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(needsApproval ? 'Approbation réussie!' : 'Achat réussi!');
      if (!needsApproval) {
        setUsdtAmount('');
      }
    }
  }, [isSuccess, needsApproval]);

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle className="text-center">Acheter avec USDT</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm text-muted-foreground">Montant USDT</label>
          <Input
            type="number"
            placeholder="0.0"
            value={usdtAmount}
            onChange={(e) => setUsdtAmount(e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-sm text-muted-foreground">Référent (optionnel)</label>
          <Input
            placeholder="0x..."
            value={referrer}
            onChange={(e) => setReferrer(e.target.value)}
            className="mt-1"
          />
        </div>

        <div className="glass rounded-lg p-3">
          <div className="text-sm text-muted-foreground">Tokens estimés:</div>
          <div className="text-lg font-semibold text-secondary">{estimatedTokens}</div>
        </div>

        {needsApproval ? (
          <Button
            onClick={handleApprove}
            disabled={isPending || !usdtAmount}
            className="w-full bg-gradient-accent hover:shadow-button"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Approbation...
              </>
            ) : (
              'Approuver USDT'
            )}
          </Button>
        ) : (
          <Button
            onClick={handleBuy}
            disabled={isPending || !usdtAmount}
            className="w-full bg-gradient-accent hover:shadow-button"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Transaction...
              </>
            ) : (
              'Acheter avec USDT'
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

// Composant UserBalances
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

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle className="text-center">Vos Soldes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="glass rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Project Tokens</div>
          <div className="text-xl font-bold text-primary">
            {projectTokenBalance ? formatEther(projectTokenBalance as bigint).slice(0, 10) : '0'}
          </div>
        </div>

        <div className="glass rounded-lg p-4">
          <div className="text-sm text-muted-foreground">USDT</div>
          <div className="text-xl font-bold text-accent">
            {usdtBalance ? formatUnits(usdtBalance as bigint, 18).slice(0, 10) : '0'}
          </div>
        </div>

        <Button
          onClick={() => window.open(`https://bscscan.com/address/${address}`, '_blank')}
          variant="outline"
          className="w-full"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Voir sur BSCScan
        </Button>
      </CardContent>
    </Card>
  );
};

export default TokenSaleDApp;
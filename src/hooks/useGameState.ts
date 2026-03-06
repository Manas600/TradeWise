import { useState, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

/** Market asset definition */
export interface MarketAsset {
  id: string;
  label: string;
  volatility: "low" | "medium" | "high";
  requiredLevel: 1 | 2 | 3;
  price: number;
  basePrice: number;
  priceHistory: number[];
}

/** Portfolio holding */
export interface Holding {
  assetId: string;
  qty: number;
  avgCost: number; // average buy price per unit
}

/** Level definition */
export interface LevelDef {
  id: number;
  title: string;
  subtitle: string;
  xpRequired: number;
}

export const LEVELS: LevelDef[] = [
  { id: 1, title: "The Owner", subtitle: "Index Funds & ETFs", xpRequired: 0 },
  { id: 2, title: "The Analyst", subtitle: "Mid-Cap & Blue Chips", xpRequired: 500 },
  { id: 3, title: "The Strategist", subtitle: "F&O & Crypto", xpRequired: 1500 },
];

const INITIAL_ASSETS: MarketAsset[] = [
  {
    id: "nifty-etf",
    label: "Nifty 50 ETF",
    volatility: "low",
    requiredLevel: 1,
    price: 23150,
    basePrice: 23150,
    priceHistory: [23150],
  },
  {
    id: "bluechip",
    label: "Blue Chip Stocks",
    volatility: "medium",
    requiredLevel: 2,
    price: 4520,
    basePrice: 4520,
    priceHistory: [4520],
  },
  {
    id: "fo-crypto",
    label: "F&O / Crypto",
    volatility: "high",
    requiredLevel: 3,
    price: 65000,
    basePrice: 65000,
    priceHistory: [65000],
  },
];

function getVolatilityRange(v: "low" | "medium" | "high") {
  switch (v) {
    case "low": return 0.02;
    case "medium": return 0.07;
    case "high": return 0.15;
  }
}

export function getCurrentLevel(xp: number): number {
  if (xp >= 1500) return 3;
  if (xp >= 500) return 2;
  return 1;
}

export function useGameState() {
  const [assets, setAssets] = useState<MarketAsset[]>(INITIAL_ASSETS);
  const [cashBalance, setCashBalance] = useState(100000);
  const [portfolio, setPortfolio] = useState<Holding[]>([]);
  const [xp, setXp] = useState(0);
  const [month, setMonth] = useState(0);
  const prevLevel = useRef(1);
  const { toast } = useToast();

  const currentLevel = getCurrentLevel(xp);

  /** Check if an asset is purchasable at current level */
  const isAssetUnlocked = useCallback(
    (asset: MarketAsset) => currentLevel >= asset.requiredLevel,
    [currentLevel]
  );

  /** Buy 1 unit of an asset */
  const buyAsset = useCallback(
    (assetId: string) => {
      const asset = assets.find((a) => a.id === assetId);
      if (!asset || !isAssetUnlocked(asset)) return false;
      if (cashBalance < asset.price) {
        toast({ title: "❌ Insufficient funds", description: `You need ₹${asset.price.toLocaleString()} but only have ₹${cashBalance.toLocaleString()}.`, variant: "destructive" });
        return false;
      }
      setCashBalance((c) => c - asset.price);
      setPortfolio((prev) => {
        const existing = prev.find((h) => h.assetId === assetId);
        if (existing) {
          const newQty = existing.qty + 1;
          const newAvg = (existing.avgCost * existing.qty + asset.price) / newQty;
          return prev.map((h) => h.assetId === assetId ? { ...h, qty: newQty, avgCost: newAvg } : h);
        }
        return [...prev, { assetId, qty: 1, avgCost: asset.price }];
      });
      return true;
    },
    [assets, cashBalance, isAssetUnlocked, toast]
  );

  /** Sell 1 unit of an asset */
  const sellAsset = useCallback(
    (assetId: string) => {
      const asset = assets.find((a) => a.id === assetId);
      const holding = portfolio.find((h) => h.assetId === assetId);
      if (!asset || !holding || holding.qty <= 0) return;

      const isAtLoss = asset.price < holding.avgCost;

      setCashBalance((c) => c + asset.price);
      setPortfolio((prev) => {
        const updated = prev.map((h) => {
          if (h.assetId !== assetId) return h;
          return { ...h, qty: h.qty - 1 };
        }).filter((h) => h.qty > 0);
        return updated;
      });

      // -20 XP penalty for selling at a loss
      if (isAtLoss) {
        setXp((prev) => Math.max(0, prev - 20));
        toast({ title: "📉 Sold at a loss!", description: "-20 XP penalty for panic selling.", variant: "destructive" });
      } else {
        toast({ title: "💰 Sold for profit!", description: `Sold 1x ${asset.label} at ₹${asset.price.toLocaleString()}.` });
      }
    },
    [assets, portfolio, toast]
  );

  /** Simulate 1 month: randomize prices + award XP */
  const simulateMonth = useCallback(() => {
    // 1. Randomize prices
    const newAssets = assets.map((a) => {
      const range = getVolatilityRange(a.volatility);
      const change = 1 + (Math.random() * 2 - 1) * range;
      const newPrice = Math.round(a.price * change);
      return { ...a, price: newPrice, priceHistory: [...a.priceHistory, newPrice] };
    });
    setAssets(newAssets);
    setMonth((m) => m + 1);

    // 2. Calculate XP
    let xpGain = 0;

    // +50 XP for holding assets
    if (portfolio.length > 0) {
      xpGain += 50;
    }

    // +10 XP per 1% positive total return
    const totalCost = portfolio.reduce((sum, h) => sum + h.avgCost * h.qty, 0);
    if (totalCost > 0) {
      const totalValue = portfolio.reduce((sum, h) => {
        const asset = newAssets.find((a) => a.id === h.assetId);
        return sum + (asset ? asset.price * h.qty : 0);
      }, 0);
      const returnPct = ((totalValue - totalCost) / totalCost) * 100;
      if (returnPct > 0) {
        xpGain += Math.floor(returnPct) * 10;
      }
    }

    const oldLevel = prevLevel.current;
    setXp((prev) => {
      const newXp = prev + xpGain;
      const newLevel = getCurrentLevel(newXp);
      // Check for level up (use timeout to avoid state conflicts)
      if (newLevel > oldLevel) {
        prevLevel.current = newLevel;
        const lvl = LEVELS[newLevel - 1];
        setTimeout(() => {
          toast({
            title: `🎉 Level ${newLevel} Unlocked!`,
            description: `You've reached "${lvl.title}" — ${lvl.subtitle} are now available!`,
            duration: 5000,
          });
        }, 100);
      }
      return newXp;
    });

    toast({
      title: `📅 Month ${month + 1} simulated`,
      description: xpGain > 0 ? `+${xpGain} XP earned!` : "No XP earned. Buy and hold assets to earn XP!",
      duration: 3000,
    });
  }, [assets, portfolio, month, toast]);

  /** Calculate total portfolio value & return */
  const portfolioValue = portfolio.reduce((sum, h) => {
    const asset = assets.find((a) => a.id === h.assetId);
    return sum + (asset ? asset.price * h.qty : 0);
  }, 0);

  const portfolioCost = portfolio.reduce((sum, h) => sum + h.avgCost * h.qty, 0);
  const totalReturn = portfolioCost > 0 ? ((portfolioValue - portfolioCost) / portfolioCost) * 100 : 0;

  return {
    assets,
    cashBalance,
    portfolio,
    xp,
    month,
    currentLevel,
    portfolioValue,
    totalReturn,
    isAssetUnlocked,
    buyAsset,
    sellAsset,
    simulateMonth,
  };
}

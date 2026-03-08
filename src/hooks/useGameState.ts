import { useState, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

export interface MarketAsset {
  id: string;
  label: string;
  volatility: "low" | "medium" | "high" | "extreme";
  requiredLevel: 1 | 2 | 3 | 4 | 5;
  price: number;
  basePrice: number;
  priceHistory: number[];
}

export interface Holding {
  assetId: string;
  qty: number;
  avgCost: number;
}

export interface LevelDef {
  id: number;
  title: string;
  subtitle: string;
  xpRequired: number;
}

export interface XpLogEntry {
  id: string;
  amount: number;
  reason: string;
  type: "gain" | "loss";
  timestamp: number;
}

export const LEVELS: LevelDef[] = [
  { id: 1, title: "The Rookie", subtitle: "Index Funds & SGBs", xpRequired: 0 },
  { id: 2, title: "The Saver", subtitle: "Large-Cap Stocks", xpRequired: 500 },
  { id: 3, title: "The Strategist", subtitle: "Mid-Cap & ETFs", xpRequired: 1500 },
  { id: 4, title: "The Tactician", subtitle: "Small-Cap & Swing", xpRequired: 3000 },
  { id: 5, title: "Risk Manager", subtitle: "F&O & Crypto", xpRequired: 5000 },
];

const INITIAL_ASSETS: MarketAsset[] = [
  { id: "nifty-etf", label: "Nifty 50 ETF", volatility: "low", requiredLevel: 1, price: 23150, basePrice: 23150, priceHistory: [23150] },
  { id: "sgb", label: "Sovereign Gold", volatility: "low", requiredLevel: 1, price: 7200, basePrice: 7200, priceHistory: [7200] },
  { id: "largecap", label: "Blue Chip Equity", volatility: "medium", requiredLevel: 2, price: 4520, basePrice: 4520, priceHistory: [4520] },
  { id: "midcap", label: "Mid-Cap Growth", volatility: "medium", requiredLevel: 3, price: 1250, basePrice: 1250, priceHistory: [1250] },
  { id: "smallcap", label: "Small-Cap Tech", volatility: "high", requiredLevel: 4, price: 340, basePrice: 340, priceHistory: [340] },
  { id: "fo-crypto", label: "High-Risk Options", volatility: "extreme", requiredLevel: 5, price: 65000, basePrice: 65000, priceHistory: [65000] },
];

function getVolatilityRange(v: "low" | "medium" | "high" | "extreme") {
  switch (v) {
    case "low": return 0.02;
    case "medium": return 0.07;
    case "high": return 0.15;
    case "extreme": return 0.30;
  }
}

export function getCurrentLevel(xp: number): number {
  if (xp >= 5000) return 5;
  if (xp >= 3000) return 4;
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
  const [xpLog, setXpLog] = useState<XpLogEntry[]>([]);
  const { toast } = useToast();

  const currentLevel = getCurrentLevel(xp);

  const addXpLog = useCallback((amount: number, reason: string, type: "gain" | "loss") => {
    setXpLog((prev) => [
      { id: Math.random().toString(36).substring(2, 9), amount, reason, type, timestamp: Date.now() },
      ...prev,
    ].slice(0, 50));
  }, []);

  const isAssetUnlocked = useCallback((asset: MarketAsset) => currentLevel >= asset.requiredLevel, [currentLevel]);

  const buyAsset = useCallback((assetId: string) => {
    const asset = assets.find((a) => a.id === assetId);
    if (!asset || !isAssetUnlocked(asset) || cashBalance < asset.price) return false;

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
  }, [assets, cashBalance, isAssetUnlocked]);

  const sellAsset = useCallback((assetId: string) => {
    const asset = assets.find((a) => a.id === assetId);
    const holding = portfolio.find((h) => h.assetId === assetId);
    if (!asset || !holding || holding.qty <= 0) return;

    const isAtLoss = asset.price < holding.avgCost;
    setCashBalance((c) => c + asset.price);
    setPortfolio((prev) => prev.map((h) => h.assetId === assetId ? { ...h, qty: h.qty - 1 } : h).filter((h) => h.qty > 0));

    if (isAtLoss) {
      setXp((prev) => Math.max(0, prev - 20));
      addXpLog(20, "Panic Sold at a loss", "loss");
    }
  }, [assets, portfolio, addXpLog]);

  const simulateMonth = useCallback(() => {
    const newAssets = assets.map((a) => {
      const range = getVolatilityRange(a.volatility);
      const change = 1 + (Math.random() * 2 - 1) * range;
      return { ...a, price: Math.max(1, Math.round(a.price * change)), priceHistory: [...a.priceHistory, Math.max(1, Math.round(a.price * change))] };
    });
    setAssets(newAssets);
    setMonth((m) => m + 1);

    let xpGain = 0;
    if (portfolio.length > 0) {
      xpGain += 50;
      addXpLog(50, "Patience Bonus (Held Assets)", "gain");
    }

    const totalCost = portfolio.reduce((sum, h) => sum + h.avgCost * h.qty, 0);
    if (totalCost > 0) {
      const totalValue = portfolio.reduce((sum, h) => {
        const asset = newAssets.find((a) => a.id === h.assetId);
        return sum + (asset ? asset.price * h.qty : 0);
      }, 0);
      const returnPct = ((totalValue - totalCost) / totalCost) * 100;
      if (returnPct > 0) {
        const returnXp = Math.floor(returnPct) * 10;
        xpGain += returnXp;
        addXpLog(returnXp, `Portfolio Growth (+${returnPct.toFixed(1)}%)`, "gain");
      }
    }

    setXp((prev) => prev + xpGain);
  }, [assets, portfolio, addXpLog]);

  // DEV OVERRIDE FUNCTION (Safely inside the hook!)
  const cheatLevelUp = useCallback(() => {
    const nextLevelNum = Math.min(5, currentLevel + 1);
    if (nextLevelNum > currentLevel) {
      const nextLevelDef = LEVELS.find(l => l.id === nextLevelNum);
      if (nextLevelDef) {
        const xpNeeded = nextLevelDef.xpRequired - xp;
        setXp(nextLevelDef.xpRequired);
        addXpLog(xpNeeded, "Admin Override: Fast-Tracked Level", "gain");
      }
    } else {
      toast({ title: "Max Level Reached", description: "You are already at Level 5." });
    }
  }, [currentLevel, xp, addXpLog, toast]);

  const portfolioValue = portfolio.reduce((sum, h) => {
    const asset = assets.find((a) => a.id === h.assetId);
    return sum + (asset ? asset.price * h.qty : 0);
  }, 0);
  const portfolioCost = portfolio.reduce((sum, h) => sum + h.avgCost * h.qty, 0);
  const totalReturn = portfolioCost > 0 ? ((portfolioValue - portfolioCost) / portfolioCost) * 100 : 0;

  return {
    assets, cashBalance, portfolio, xp, month, currentLevel, portfolioValue, totalReturn, xpLog,
    isAssetUnlocked, buyAsset, sellAsset, simulateMonth, cheatLevelUp
  };
}
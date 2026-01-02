// ===========================================
// PAIR ANALYSIS ENDPOINT
// ===========================================
// DEX pair safety and trading analysis
// Price: $0.002 USDC

import { NextRequest, NextResponse } from 'next/server';
import { withPayment } from '@/lib/x402';
import { 
  fetchGoPlusToken,
  isValidAddress, 
  normalizeChainId,
  getChainName,
  type GoPlusTokenData,
} from '@/lib/data-sources';

// ===========================================
// TYPES
// ===========================================
interface DexInfo {
  name: string;
  pair?: string;
  liquidity?: string;
  liquidity_type?: string;
}

// ===========================================
// SAFETY SCORE CALCULATION
// ===========================================
interface SafetyAssessment {
  score: number;
  grade: 'SAFE' | 'CAUTION' | 'DANGER';
  issues: string[];
}

function calculateSafety(data: GoPlusTokenData): SafetyAssessment {
  let score = 100;
  const issues: string[] = [];
  
  const dexInfo = (data.dex || []) as DexInfo[];
  
  // No DEX listings
  if (dexInfo.length === 0) {
    score -= 35;
    issues.push('no_dex_pairs');
  }
  
  // Liquidity analysis
  const totalLiquidity = dexInfo.reduce(
    (sum, d) => sum + parseFloat(d.liquidity || '0'), 0
  );
  
  if (totalLiquidity < 1000) {
    score -= 40;
    issues.push('very_low_liquidity');
  } else if (totalLiquidity < 10000) {
    score -= 25;
    issues.push('low_liquidity');
  } else if (totalLiquidity < 50000) {
    score -= 10;
    issues.push('moderate_liquidity');
  }
  
  // Tax analysis
  const buyTax = data.buy_tax ? parseFloat(data.buy_tax) * 100 : 0;
  const sellTax = data.sell_tax ? parseFloat(data.sell_tax) * 100 : 0;
  
  if (buyTax > 20 || sellTax > 20) {
    score -= 25;
    issues.push('extreme_taxes');
  } else if (buyTax > 10 || sellTax > 10) {
    score -= 15;
    issues.push('high_taxes');
  } else if (buyTax > 5 || sellTax > 5) {
    score -= 5;
    issues.push('moderate_taxes');
  } else if (buyTax > 0 || sellTax > 0) {
    issues.push('has_taxes');
  }
  
  // Honeypot check
  if (data.is_honeypot === '1') {
    score -= 50;
    issues.push('honeypot_detected');
  }
  
  // Trading restrictions
  if (data.cannot_buy === '1') {
    score -= 30;
    issues.push('buying_disabled');
  }
  if (data.cannot_sell_all === '1') {
    score -= 35;
    issues.push('selling_restricted');
  }
  if (data.trading_cooldown === '1') {
    score -= 5;
    issues.push('trading_cooldown');
  }

  score = Math.max(score, 0);

  let grade: SafetyAssessment['grade'];
  if (score >= 70) grade = 'SAFE';
  else if (score >= 40) grade = 'CAUTION';
  else grade = 'DANGER';

  return { score, grade, issues };
}

// ===========================================
// HANDLER
// ===========================================
async function handler(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get('address');
  const chain = searchParams.get('chain') || 'base';

  // Validation
  if (!address) {
    return NextResponse.json(
      { error: 'Missing required parameter: address' },
      { status: 400 }
    );
  }

  if (!isValidAddress(address)) {
    return NextResponse.json(
      { error: 'Invalid address format. Expected 0x followed by 40 hex characters.' },
      { status: 400 }
    );
  }

  const chainId = normalizeChainId(chain);

  try {
    const result = await fetchGoPlusToken(address, chainId);

    if (!result.data) {
      return NextResponse.json(
        { error: result.error || 'Token not found or not supported on this chain' },
        { status: 404 }
      );
    }

    const tokenData = result.data;
    const dexInfo = (tokenData.dex || []) as DexInfo[];
    const safety = calculateSafety(tokenData);
    
    // Calculate totals
    const totalLiquidity = dexInfo.reduce(
      (sum, d) => sum + parseFloat(d.liquidity || '0'), 0
    );
    const buyTax = tokenData.buy_tax ? parseFloat(tokenData.buy_tax) * 100 : 0;
    const sellTax = tokenData.sell_tax ? parseFloat(tokenData.sell_tax) * 100 : 0;

    const response = {
      address: address.toLowerCase(),
      chain: getChainName(chainId),
      chainId,
      name: tokenData.token_name || null,
      symbol: tokenData.token_symbol || null,
      
      // Safety assessment
      safetyScore: safety.score,
      safetyGrade: safety.grade,
      issues: safety.issues,
      
      // DEX pairs
      pairs: dexInfo.map(d => ({
        dex: d.name || 'Unknown DEX',
        pair: d.pair || null,
        liquidity: parseFloat(d.liquidity || '0'),
        liquidityFormatted: formatLiquidity(parseFloat(d.liquidity || '0')),
        liquidityType: d.liquidity_type || null,
      })),
      
      // Pair statistics
      pairStats: {
        totalPairs: dexInfo.length,
        totalLiquidity,
        totalLiquidityFormatted: formatLiquidity(totalLiquidity),
        primaryDex: dexInfo.length > 0 ? dexInfo[0].name : null,
        liquidityStatus: totalLiquidity >= 100000 ? 'HIGH' :
                        totalLiquidity >= 10000 ? 'MODERATE' :
                        totalLiquidity >= 1000 ? 'LOW' : 'VERY_LOW',
      },
      
      // Trading conditions
      trading: {
        buyTax: Math.round(buyTax * 100) / 100,
        sellTax: Math.round(sellTax * 100) / 100,
        totalTax: Math.round((buyTax + sellTax) * 100) / 100,
        isHoneypot: tokenData.is_honeypot === '1',
        canBuy: tokenData.cannot_buy !== '1',
        canSellAll: tokenData.cannot_sell_all !== '1',
        hasTradingCooldown: tokenData.trading_cooldown === '1',
        tradingStatus: tokenData.is_honeypot === '1' ? 'BLOCKED' :
                       tokenData.cannot_sell_all === '1' ? 'RESTRICTED' :
                       (buyTax + sellTax) > 20 ? 'HIGH_FEES' : 'OPEN',
      },
      
      // Token info
      token: {
        totalSupply: tokenData.total_supply || null,
        holderCount: tokenData.holder_count ? parseInt(tokenData.holder_count) : null,
        isOpenSource: tokenData.is_open_source === '1',
        isProxy: tokenData.is_proxy === '1',
      },
      
      // Meta
      cached: result.cached,
      source: 'GoPlus Security API',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Pair analysis failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ===========================================
// HELPERS
// ===========================================
function formatLiquidity(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(2)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(2)}K`;
  }
  return `$${amount.toFixed(2)}`;
}

// ===========================================
// EXPORT WITH PAYMENT
// ===========================================
export const GET = withPayment(
  {
    price: '0.002',
    description: 'DEX pair safety and trading analysis'
  },
  handler
);

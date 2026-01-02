// ===========================================
// LIQUIDITY CHECK ENDPOINT
// ===========================================
// Liquidity analysis and rug pull risk assessment
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
interface LpHolder {
  address: string;
  percent: string;
  is_contract: number;
  is_locked: number;
  tag?: string;
}

// ===========================================
// RUG PULL RISK CALCULATION
// ===========================================
interface RugRiskAssessment {
  score: number;
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  warnings: string[];
}

function calculateRugRisk(data: GoPlusTokenData): RugRiskAssessment {
  let score = 0;
  const warnings: string[] = [];
  
  const lpHolders = (data.lp_holders || []) as LpHolder[];
  
  // Calculate locked LP percentage
  const totalLpLocked = lpHolders
    .filter(h => h.is_locked === 1)
    .reduce((sum, h) => sum + parseFloat(h.percent || '0'), 0);
  
  // LP Lock Analysis
  if (totalLpLocked < 30) {
    score += 40;
    warnings.push('very_low_lp_locked');
  } else if (totalLpLocked < 50) {
    score += 30;
    warnings.push('low_lp_locked');
  } else if (totalLpLocked < 80) {
    score += 15;
    warnings.push('partial_lp_locked');
  }
  
  // Owner LP concentration
  const unlockedLpPercent = lpHolders
    .filter(h => h.is_contract === 0 && h.is_locked !== 1)
    .reduce((sum, h) => sum + parseFloat(h.percent || '0'), 0);
  
  if (unlockedLpPercent > 50) {
    score += 30;
    warnings.push('owner_controls_majority_lp');
  } else if (unlockedLpPercent > 30) {
    score += 20;
    warnings.push('owner_holds_significant_lp');
  } else if (unlockedLpPercent > 10) {
    score += 10;
    warnings.push('owner_holds_notable_lp');
  }
  
  // Anti-whale protection
  if (data.is_anti_whale !== '1' && unlockedLpPercent > 10) {
    score += 10;
    warnings.push('no_anti_whale_protection');
  }
  
  // Sell restrictions (soft rug indicator)
  if (data.cannot_sell_all === '1') {
    score += 25;
    warnings.push('cannot_sell_all');
  }
  
  // High sell tax (soft rug)
  const sellTax = data.sell_tax ? parseFloat(data.sell_tax) * 100 : 0;
  if (sellTax > 30) {
    score += 25;
    warnings.push('extreme_sell_tax');
  } else if (sellTax > 20) {
    score += 15;
    warnings.push('very_high_sell_tax');
  } else if (sellTax > 10) {
    score += 10;
    warnings.push('high_sell_tax');
  }
  
  // Mintable tokens (inflation risk)
  if (data.is_mintable === '1') {
    score += 10;
    warnings.push('mintable_supply');
  }

  score = Math.min(score, 100);

  let level: RugRiskAssessment['level'] = 'LOW';
  if (score >= 70) level = 'CRITICAL';
  else if (score >= 50) level = 'HIGH';
  else if (score >= 30) level = 'MEDIUM';

  return { score, level, warnings };
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
    const lpHolders = (tokenData.lp_holders || []) as LpHolder[];
    const rugRisk = calculateRugRisk(tokenData);
    
    // Calculate LP stats
    const totalLpLocked = lpHolders
      .filter(h => h.is_locked === 1)
      .reduce((sum, h) => sum + parseFloat(h.percent || '0'), 0);

    const response = {
      address: address.toLowerCase(),
      chain: getChainName(chainId),
      chainId,
      name: tokenData.token_name || null,
      symbol: tokenData.token_symbol || null,
      
      // Rug pull risk assessment
      rugPullRisk: rugRisk.score,
      riskLevel: rugRisk.level,
      warnings: rugRisk.warnings,
      
      // Liquidity overview
      liquidity: {
        totalLpLockedPercent: Math.round(totalLpLocked * 100) / 100,
        lpHolderCount: lpHolders.length,
        isLiquidityLocked: totalLpLocked >= 80,
        lockStatus: totalLpLocked >= 80 ? 'LOCKED' : 
                    totalLpLocked >= 50 ? 'PARTIAL' : 'UNLOCKED',
      },
      
      // Top LP holders
      topLpHolders: lpHolders.slice(0, 5).map(h => ({
        address: h.address,
        percent: Math.round(parseFloat(h.percent || '0') * 100) / 100,
        isLocked: h.is_locked === 1,
        isContract: h.is_contract === 1,
        tag: h.tag || null,
      })),
      
      // Trading info
      tradingInfo: {
        buyTax: tokenData.buy_tax ? parseFloat(tokenData.buy_tax) * 100 : 0,
        sellTax: tokenData.sell_tax ? parseFloat(tokenData.sell_tax) * 100 : 0,
        cannotSellAll: tokenData.cannot_sell_all === '1',
        hasAntiWhale: tokenData.is_anti_whale === '1',
        isMintable: tokenData.is_mintable === '1',
      },
      
      // Holder concentration
      holderStats: {
        totalHolders: tokenData.holder_count ? parseInt(tokenData.holder_count) : null,
        top10HolderPercent: tokenData.holders 
          ? (tokenData.holders as LpHolder[]).slice(0, 10)
              .reduce((sum, h) => sum + parseFloat(h.percent || '0'), 0)
          : null,
      },
      
      // Meta
      cached: result.cached,
      source: 'GoPlus Security API',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Liquidity check failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ===========================================
// EXPORT WITH PAYMENT
// ===========================================
export const GET = withPayment(
  {
    price: '0.002',
    description: 'Liquidity analysis and rug pull risk assessment'
  },
  handler
);

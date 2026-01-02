// ===========================================
// WHALE ACTIVITY ENDPOINT
// ===========================================
// Whale and holder concentration analysis
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
interface Holder {
  address: string;
  percent: string;
  is_contract: number;
  is_locked: number;
  tag?: string;
}

// ===========================================
// CONCENTRATION RISK CALCULATION
// ===========================================
interface ConcentrationRisk {
  score: number;
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  alerts: string[];
}

function calculateConcentrationRisk(data: GoPlusTokenData): ConcentrationRisk {
  let score = 0;
  const alerts: string[] = [];
  
  const holders = (data.holders || []) as Holder[];
  const top10Holders = holders.slice(0, 10);
  
  // Top 10 concentration
  const top10Percent = top10Holders.reduce(
    (sum, h) => sum + parseFloat(h.percent || '0'), 0
  );
  
  if (top10Percent > 80) {
    score += 40;
    alerts.push('extreme_concentration');
  } else if (top10Percent > 60) {
    score += 25;
    alerts.push('high_concentration');
  } else if (top10Percent > 40) {
    score += 10;
    alerts.push('moderate_concentration');
  }
  
  // Single whale dominance
  const largestHolder = holders[0];
  const largestPercent = largestHolder ? parseFloat(largestHolder.percent || '0') : 0;
  
  if (largestPercent > 50) {
    score += 35;
    alerts.push('single_wallet_majority');
  } else if (largestPercent > 25) {
    score += 20;
    alerts.push('large_single_holder');
  } else if (largestPercent > 10) {
    score += 10;
    alerts.push('notable_single_holder');
  }
  
  // Creator/owner holdings
  const creatorAddress = data.creator_address?.toLowerCase();
  const ownerAddress = data.owner_address?.toLowerCase();
  
  const creatorHolding = holders.find(h => 
    h.address?.toLowerCase() === creatorAddress
  );
  const ownerHolding = holders.find(h => 
    h.address?.toLowerCase() === ownerAddress
  );
  
  const creatorPercent = creatorHolding ? parseFloat(creatorHolding.percent || '0') : 0;
  const ownerPercent = ownerHolding ? parseFloat(ownerHolding.percent || '0') : 0;
  
  if (creatorPercent > 20 || ownerPercent > 20) {
    score += 20;
    alerts.push('insider_holds_significant');
  } else if (creatorPercent > 10 || ownerPercent > 10) {
    score += 10;
    alerts.push('insider_holds_notable');
  }
  
  // Low holder count = manipulation risk
  const holderCount = data.holder_count ? parseInt(data.holder_count) : 0;
  
  if (holderCount < 50) {
    score += 25;
    alerts.push('very_low_holder_count');
  } else if (holderCount < 100) {
    score += 15;
    alerts.push('low_holder_count');
  } else if (holderCount < 500) {
    score += 5;
    alerts.push('limited_holder_base');
  }

  score = Math.min(score, 100);

  let level: ConcentrationRisk['level'] = 'LOW';
  if (score >= 60) level = 'CRITICAL';
  else if (score >= 40) level = 'HIGH';
  else if (score >= 20) level = 'MEDIUM';

  return { score, level, alerts };
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
    const holders = (tokenData.holders || []) as Holder[];
    const lpHolders = (tokenData.lp_holders || []) as Holder[];
    const concentration = calculateConcentrationRisk(tokenData);
    
    // Identify whales (>1% holders)
    const whales = holders.filter(h => parseFloat(h.percent || '0') >= 1);
    const top10Holders = holders.slice(0, 10);
    
    // Calculate stats
    const top10Percent = top10Holders.reduce(
      (sum, h) => sum + parseFloat(h.percent || '0'), 0
    );
    const holderCount = tokenData.holder_count ? parseInt(tokenData.holder_count) : 0;

    const response = {
      address: address.toLowerCase(),
      chain: getChainName(chainId),
      chainId,
      name: tokenData.token_name || null,
      symbol: tokenData.token_symbol || null,
      
      // Concentration risk
      concentrationRisk: concentration.score,
      riskLevel: concentration.level,
      alerts: concentration.alerts,
      
      // Holder statistics
      holderStats: {
        totalHolders: holderCount,
        whaleCount: whales.length,
        top10HoldPercent: Math.round(top10Percent * 100) / 100,
        averageHoldPercent: holderCount > 0 
          ? Math.round((100 / holderCount) * 100) / 100 
          : 0,
        distribution: holderCount > 1000 ? 'HEALTHY' :
                      holderCount > 500 ? 'MODERATE' :
                      holderCount > 100 ? 'LIMITED' : 'CONCENTRATED',
      },
      
      // Top 10 holders
      topHolders: top10Holders.map(h => ({
        address: h.address,
        percent: Math.round(parseFloat(h.percent || '0') * 100) / 100,
        isContract: h.is_contract === 1,
        isLocked: h.is_locked === 1,
        tag: h.tag || null,
      })),
      
      // Whales (>1%)
      whales: whales.map(h => ({
        address: h.address,
        percent: Math.round(parseFloat(h.percent || '0') * 100) / 100,
        isContract: h.is_contract === 1,
        tag: h.tag || null,
      })),
      
      // Key addresses
      keyAddresses: {
        creator: {
          address: tokenData.creator_address || null,
          holdingPercent: holders.find(h => 
            h.address?.toLowerCase() === tokenData.creator_address?.toLowerCase()
          )?.percent ? parseFloat(holders.find(h => 
            h.address?.toLowerCase() === tokenData.creator_address?.toLowerCase()
          )!.percent) : 0,
        },
        owner: {
          address: tokenData.owner_address || null,
          holdingPercent: holders.find(h => 
            h.address?.toLowerCase() === tokenData.owner_address?.toLowerCase()
          )?.percent ? parseFloat(holders.find(h => 
            h.address?.toLowerCase() === tokenData.owner_address?.toLowerCase()
          )!.percent) : 0,
        },
      },
      
      // LP concentration
      lpConcentration: {
        lpHolderCount: lpHolders.length,
        topLpHolders: lpHolders.slice(0, 3).map(h => ({
          address: h.address,
          percent: Math.round(parseFloat(h.percent || '0') * 100) / 100,
          isLocked: h.is_locked === 1,
        })),
      },
      
      // Meta
      cached: result.cached,
      source: 'GoPlus Security API',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Whale activity check failed:', error);
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
    description: 'Whale and holder concentration analysis'
  },
  handler
);

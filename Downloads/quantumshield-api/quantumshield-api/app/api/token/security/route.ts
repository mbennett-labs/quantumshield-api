// ===========================================
// TOKEN SECURITY ENDPOINT
// ===========================================
// Comprehensive token risk analysis
// Price: $0.002 USDC

import { NextRequest, NextResponse } from 'next/server';
import { withPayment } from '@/lib/x402';
import { 
  fetchGoPlusToken, 
  fetchHoneypot,
  isValidAddress, 
  normalizeChainId,
  getChainName,
  type GoPlusTokenData,
  type HoneypotData,
} from '@/lib/data-sources';

// ===========================================
// RISK CALCULATION
// ===========================================
interface RiskAssessment {
  score: number;
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  risks: string[];
  warnings: string[];
}

function calculateRisk(
  goplus: GoPlusTokenData | null,
  honeypot: HoneypotData | null
): RiskAssessment {
  let score = 0;
  const risks: string[] = [];
  const warnings: string[] = [];

  if (!goplus) {
    return { score: 0, level: 'LOW', risks: ['no_data'], warnings: [] };
  }

  // Critical risks (high score impact)
  if (goplus.is_honeypot === '1') { 
    score += 50; 
    risks.push('honeypot_detected'); 
  }
  if (goplus.cannot_sell_all === '1') { 
    score += 30; 
    risks.push('cannot_sell_all'); 
  }
  if (goplus.owner_change_balance === '1') { 
    score += 25; 
    risks.push('owner_can_change_balance'); 
  }
  
  // High risks
  if (goplus.is_blacklisted === '1') { 
    score += 20; 
    risks.push('has_blacklist_function'); 
  }
  if (goplus.can_take_back_ownership === '1') { 
    score += 15; 
    risks.push('ownership_reclaimable'); 
  }
  if (goplus.hidden_owner === '1') { 
    score += 15; 
    risks.push('hidden_owner'); 
  }
  
  // Medium risks / warnings
  if (goplus.is_proxy === '1') { 
    score += 10; 
    warnings.push('upgradeable_proxy'); 
  }
  if (goplus.is_mintable === '1') { 
    score += 10; 
    warnings.push('mintable_supply'); 
  }
  if (goplus.is_open_source !== '1') { 
    score += 10; 
    warnings.push('unverified_contract'); 
  }
  
  // Tax analysis
  const buyTax = parseFloat(goplus.buy_tax || '0') * 100;
  const sellTax = parseFloat(goplus.sell_tax || '0') * 100;
  
  if (sellTax > 20) { 
    score += 20; 
    risks.push(`very_high_sell_tax_${sellTax.toFixed(1)}%`); 
  } else if (sellTax > 10) { 
    score += 10; 
    warnings.push(`high_sell_tax_${sellTax.toFixed(1)}%`); 
  }
  
  if (buyTax > 20) { 
    score += 15; 
    risks.push(`very_high_buy_tax_${buyTax.toFixed(1)}%`); 
  } else if (buyTax > 10) { 
    score += 5; 
    warnings.push(`high_buy_tax_${buyTax.toFixed(1)}%`); 
  }

  // Honeypot.is confirmation
  if (honeypot?.honeypotResult?.isHoneypot && !risks.includes('honeypot_detected')) {
    score += 50;
    risks.push('honeypot_confirmed_simulation');
  }

  // Determine level
  let level: RiskAssessment['level'] = 'LOW';
  if (score >= 70) level = 'CRITICAL';
  else if (score >= 50) level = 'HIGH';
  else if (score >= 25) level = 'MEDIUM';

  return {
    score: Math.min(score, 100),
    level,
    risks,
    warnings,
  };
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
    // Fetch from multiple sources in parallel
    const [goplusResult, honeypotResult] = await Promise.all([
      fetchGoPlusToken(address, chainId),
      fetchHoneypot(address, chainId),
    ]);

    // Need at least GoPlus data
    if (!goplusResult.data) {
      return NextResponse.json(
        { error: goplusResult.error || 'Token not found or not supported on this chain' }, 
        { status: 404 }
      );
    }

    const goplus = goplusResult.data;
    const honeypot = honeypotResult.data;
    
    // Calculate risk
    const risk = calculateRisk(goplus, honeypot);

    // Build response
    const result = {
      address: address.toLowerCase(),
      chain: getChainName(chainId),
      chainId,
      name: goplus.token_name || null,
      symbol: goplus.token_symbol || null,
      
      // Risk assessment
      riskScore: risk.score,
      riskLevel: risk.level,
      risks: risk.risks,
      warnings: risk.warnings,
      
      // Key metrics
      metrics: {
        holders: goplus.holder_count ? parseInt(goplus.holder_count) : null,
        lpHolders: goplus.lp_holder_count ? parseInt(goplus.lp_holder_count) : null,
        buyTax: goplus.buy_tax ? parseFloat(goplus.buy_tax) * 100 : 0,
        sellTax: goplus.sell_tax ? parseFloat(goplus.sell_tax) * 100 : 0,
        isOpenSource: goplus.is_open_source === '1',
        isProxy: goplus.is_proxy === '1',
      },
      
      // Data sources used
      sources: {
        goplus: !goplusResult.cached,
        honeypot: honeypotResult.data !== null,
        cached: goplusResult.cached || honeypotResult.cached,
      },
      
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Token security analysis failed:', error);
    return NextResponse.json(
      { 
        error: 'Analysis failed', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      }, 
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
    description: 'Comprehensive token security analysis including honeypot detection, tax analysis, and ownership flags' 
  },
  handler
);

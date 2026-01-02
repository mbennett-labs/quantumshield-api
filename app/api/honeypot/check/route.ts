// ===========================================
// HONEYPOT CHECK ENDPOINT
// ===========================================
// Dedicated honeypot detection with simulation
// Price: $0.001 USDC (cheapest - focused check)

import { NextRequest, NextResponse } from 'next/server';
import { withPayment } from '@/lib/x402';
import { 
  fetchGoPlusToken, 
  fetchHoneypot,
  isValidAddress, 
  normalizeChainId,
  getChainName,
} from '@/lib/data-sources';

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
    // Fetch from both sources for best accuracy
    const [goplusResult, honeypotResult] = await Promise.all([
      fetchGoPlusToken(address, chainId),
      fetchHoneypot(address, chainId),
    ]);

    // Need at least one data source
    if (!goplusResult.data && !honeypotResult.data) {
      return NextResponse.json(
        { error: 'Token not found or not supported on this chain' },
        { status: 404 }
      );
    }

    const goplus = goplusResult.data;
    const honeypot = honeypotResult.data;
    
    // Determine honeypot status from multiple sources
    const goplusHoneypot = goplus?.is_honeypot === '1';
    const honeypotIsHoneypot = honeypot?.honeypotResult?.isHoneypot === true;
    const isHoneypot = goplusHoneypot || honeypotIsHoneypot;
    
    // Get tax info (prefer Honeypot.is simulation data if available)
    let buyTax = 0;
    let sellTax = 0;
    
    if (honeypot?.simulationResult) {
      buyTax = honeypot.simulationResult.buyTax || 0;
      sellTax = honeypot.simulationResult.sellTax || 0;
    } else if (goplus) {
      buyTax = goplus.buy_tax ? parseFloat(goplus.buy_tax) * 100 : 0;
      sellTax = goplus.sell_tax ? parseFloat(goplus.sell_tax) * 100 : 0;
    }
    
    // Determine status
    const hasHighTax = buyTax > 10 || sellTax > 10;
    const hasAnyTax = buyTax > 0 || sellTax > 0;
    const hasRestrictions = goplus?.cannot_sell_all === '1' || goplus?.cannot_buy === '1';
    
    let status: 'SAFE' | 'WARNING' | 'DANGER';
    if (isHoneypot || hasHighTax || hasRestrictions) {
      status = 'DANGER';
    } else if (hasAnyTax || goplus?.is_proxy === '1' || goplus?.hidden_owner === '1') {
      status = 'WARNING';
    } else {
      status = 'SAFE';
    }

    const result = {
      address: address.toLowerCase(),
      chain: getChainName(chainId),
      chainId,
      
      // Core honeypot verdict
      isHoneypot,
      status,
      confidence: (goplusHoneypot && honeypotIsHoneypot) ? 'HIGH' : 
                  (goplusHoneypot || honeypotIsHoneypot) ? 'MEDIUM' : 'LOW',
      
      // Tax information
      taxes: {
        buy: Math.round(buyTax * 100) / 100,
        sell: Math.round(sellTax * 100) / 100,
        total: Math.round((buyTax + sellTax) * 100) / 100,
        hasAnyTax,
        hasHighTax,
      },
      
      // Trading flags
      flags: {
        cannotSell: goplus?.cannot_sell_all === '1',
        cannotBuy: goplus?.cannot_buy === '1',
        isProxy: goplus?.is_proxy === '1',
        hiddenOwner: goplus?.hidden_owner === '1',
        selfDestruct: goplus?.selfdestruct === '1',
        hasTradingCooldown: goplus?.trading_cooldown === '1',
      },
      
      // Simulation data from Honeypot.is (if available)
      simulation: honeypot ? {
        available: true,
        riskLevel: honeypot.riskLevel || null,
        liquidity: honeypot.pair?.liquidity || null,
      } : {
        available: false,
      },
      
      // Data sources
      sources: {
        goplus: goplusResult.data !== null,
        honeypotIs: honeypotResult.data !== null,
        cached: goplusResult.cached || honeypotResult.cached,
      },
      
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Honeypot check failed:', error);
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
    price: '0.001',
    description: 'Honeypot detection with buy/sell simulation'
  },
  handler
);

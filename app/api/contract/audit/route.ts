// ===========================================
// CONTRACT AUDIT ENDPOINT
// ===========================================
// Comprehensive smart contract security audit
// Price: $0.003 USDC (most comprehensive)

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
// AUDIT SCORING
// ===========================================
interface AuditResult {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  flags: string[];
  criticalIssues: string[];
  warnings: string[];
}

function performAudit(data: GoPlusTokenData): AuditResult {
  let score = 100;
  const flags: string[] = [];
  const criticalIssues: string[] = [];
  const warnings: string[] = [];

  // ===========================================
  // CRITICAL ISSUES (Major deductions)
  // ===========================================
  
  // Contract not verified - can't audit what we can't see
  if (data.is_open_source !== '1') { 
    score -= 30; 
    flags.push('not_open_source');
    criticalIssues.push('Contract source code is not verified - cannot audit');
  }
  
  // Self-destruct capability
  if (data.selfdestruct === '1') { 
    score -= 25; 
    flags.push('has_selfdestruct');
    criticalIssues.push('Contract can self-destruct, destroying all funds');
  }
  
  // Owner can modify balances
  if (data.owner_change_balance === '1') { 
    score -= 25; 
    flags.push('owner_can_change_balance');
    criticalIssues.push('Owner can arbitrarily modify token balances');
  }
  
  // Sell restrictions
  if (data.cannot_sell_all === '1') { 
    score -= 30; 
    flags.push('sell_restricted');
    criticalIssues.push('Users cannot sell all their tokens');
  }

  // ===========================================
  // HIGH SEVERITY (Significant deductions)
  // ===========================================
  
  // Ownership issues
  if (data.can_take_back_ownership === '1') { 
    score -= 20; 
    flags.push('ownership_reclaimable');
    warnings.push('Ownership can be reclaimed after renouncement');
  }
  if (data.hidden_owner === '1') { 
    score -= 15; 
    flags.push('hidden_owner');
    warnings.push('Contract has hidden owner functionality');
  }
  
  // Buy restrictions
  if (data.cannot_buy === '1') { 
    score -= 20; 
    flags.push('buy_disabled');
    criticalIssues.push('Buying is currently disabled');
  }
  
  // Upgradeable proxy
  if (data.is_proxy === '1') { 
    score -= 15; 
    flags.push('upgradeable_proxy');
    warnings.push('Contract is upgradeable - logic can change');
  }

  // ===========================================
  // MEDIUM SEVERITY (Moderate deductions)
  // ===========================================
  
  // Blacklist/whitelist mechanisms
  if (data.is_blacklisted === '1') { 
    score -= 15; 
    flags.push('has_blacklist');
    warnings.push('Contract has blacklist functionality');
  }
  if (data.is_whitelisted === '1') { 
    score -= 10; 
    flags.push('has_whitelist');
    warnings.push('Contract has whitelist functionality');
  }
  
  // Minting capability
  if (data.is_mintable === '1') { 
    score -= 15; 
    flags.push('mintable');
    warnings.push('New tokens can be minted');
  }
  
  // External calls
  if (data.external_call === '1') { 
    score -= 10; 
    flags.push('external_calls');
    warnings.push('Contract makes external calls');
  }
  
  // Trading cooldown
  if (data.trading_cooldown === '1') { 
    score -= 10; 
    flags.push('trading_cooldown');
    warnings.push('Trading cooldown mechanism present');
  }

  // ===========================================
  // LOW SEVERITY (Minor deductions)
  // ===========================================
  
  // Anti-whale (usually protective, slight flag)
  if (data.is_anti_whale === '1') { 
    score -= 5; 
    flags.push('anti_whale');
    // Not a warning - often beneficial
  }

  // Ensure score doesn't go below 0
  score = Math.max(score, 0);

  // Calculate grade
  let grade: AuditResult['grade'];
  if (score >= 80) grade = 'A';
  else if (score >= 60) grade = 'B';
  else if (score >= 40) grade = 'C';
  else if (score >= 20) grade = 'D';
  else grade = 'F';

  return { score, grade, flags, criticalIssues, warnings };
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
        { error: result.error || 'Contract not found or not supported on this chain' },
        { status: 404 }
      );
    }

    const tokenData = result.data;
    const audit = performAudit(tokenData);

    const response = {
      address: address.toLowerCase(),
      chain: getChainName(chainId),
      chainId,
      name: tokenData.token_name || null,
      symbol: tokenData.token_symbol || null,
      
      // Audit results
      securityScore: audit.score,
      grade: audit.grade,
      auditFlags: audit.flags,
      flagCount: audit.flags.length,
      
      // Issues breakdown
      criticalIssues: audit.criticalIssues,
      warnings: audit.warnings,
      
      // Contract details
      contractDetails: {
        isOpenSource: tokenData.is_open_source === '1',
        isProxy: tokenData.is_proxy === '1',
        hasSelfdestruct: tokenData.selfdestruct === '1',
        hasExternalCalls: tokenData.external_call === '1',
        creator: tokenData.creator_address || null,
        owner: tokenData.owner_address || null,
        totalSupply: tokenData.total_supply || null,
        holderCount: tokenData.holder_count ? parseInt(tokenData.holder_count) : null,
      },
      
      // Ownership analysis
      ownershipRisks: {
        canReclaimOwnership: tokenData.can_take_back_ownership === '1',
        ownerCanChangeBalance: tokenData.owner_change_balance === '1',
        hiddenOwner: tokenData.hidden_owner === '1',
        ownerAddress: tokenData.owner_address || null,
      },
      
      // Trading restrictions
      tradingRestrictions: {
        cannotBuy: tokenData.cannot_buy === '1',
        cannotSellAll: tokenData.cannot_sell_all === '1',
        hasTradingCooldown: tokenData.trading_cooldown === '1',
        hasBlacklist: tokenData.is_blacklisted === '1',
        hasWhitelist: tokenData.is_whitelisted === '1',
        hasAntiWhale: tokenData.is_anti_whale === '1',
      },
      
      // Tokenomics
      tokenomics: {
        isMintable: tokenData.is_mintable === '1',
        buyTax: tokenData.buy_tax ? parseFloat(tokenData.buy_tax) * 100 : 0,
        sellTax: tokenData.sell_tax ? parseFloat(tokenData.sell_tax) * 100 : 0,
        totalTax: tokenData.buy_tax && tokenData.sell_tax 
          ? (parseFloat(tokenData.buy_tax) + parseFloat(tokenData.sell_tax)) * 100 
          : 0,
      },
      
      // Meta
      cached: result.cached,
      source: 'GoPlus Security API',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Contract audit failed:', error);
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
    price: '0.003',
    description: 'Comprehensive smart contract security audit with grade scoring'
  },
  handler
);

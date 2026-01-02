// ===========================================
// WALLET RISK ENDPOINT
// ===========================================
// Wallet/address reputation and risk scoring
// Price: $0.002 USDC

import { NextRequest, NextResponse } from 'next/server';
import { withPayment } from '@/lib/x402';
import { 
  fetchGoPlusAddress,
  isValidAddress, 
  normalizeChainId,
  getChainName,
  type GoPlusAddressData,
} from '@/lib/data-sources';

// ===========================================
// RISK CALCULATION
// ===========================================
interface WalletRiskAssessment {
  score: number;
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  risks: string[];
  categories: string[];
}

function calculateWalletRisk(data: GoPlusAddressData): WalletRiskAssessment {
  let score = 0;
  const risks: string[] = [];
  const categories: string[] = [];

  // Critical risks (criminal activity)
  if (data.stealing_attack === '1') { 
    score += 50; 
    risks.push('stealing_attack'); 
    categories.push('criminal');
  }
  if (data.cybercrime === '1') { 
    score += 45; 
    risks.push('cybercrime'); 
    categories.push('criminal');
  }
  if (data.phishing_activities === '1') { 
    score += 40; 
    risks.push('phishing_activities'); 
    categories.push('scam');
  }
  if (data.money_laundering === '1') { 
    score += 40; 
    risks.push('money_laundering'); 
    categories.push('financial_crime');
  }
  
  // High risks
  if (data.financial_crime === '1') { 
    score += 35; 
    risks.push('financial_crime'); 
    categories.push('financial_crime');
  }
  if (data.darkweb_transactions === '1') { 
    score += 35; 
    risks.push('darkweb_transactions'); 
    categories.push('illicit');
  }
  if (data.malicious_mining_activities === '1') { 
    score += 30; 
    risks.push('malicious_mining'); 
    categories.push('malware');
  }
  if (data.blacklist_doubt === '1') { 
    score += 30; 
    risks.push('blacklist_doubt'); 
    categories.push('flagged');
  }
  
  // Medium risks
  if (data.honeypot_related_address === '1') { 
    score += 25; 
    risks.push('honeypot_related'); 
    categories.push('scam');
  }
  if (data.fake_kyc === '1') { 
    score += 20; 
    risks.push('fake_kyc'); 
    categories.push('fraud');
  }

  // Determine level
  let level: WalletRiskAssessment['level'] = 'LOW';
  if (score >= 70) level = 'CRITICAL';
  else if (score >= 50) level = 'HIGH';
  else if (score >= 25) level = 'MEDIUM';

  // Deduplicate categories
  const uniqueCategories = [...new Set(categories)];

  return {
    score: Math.min(score, 100),
    level,
    risks,
    categories: uniqueCategories,
  };
}

// ===========================================
// HANDLER
// ===========================================
async function handler(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get('address');
  const chain = searchParams.get('chain') || 'ethereum'; // Default to ETH for wallet checks

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
    const result = await fetchGoPlusAddress(address, chainId);

    if (!result.data) {
      return NextResponse.json(
        { error: result.error || 'Unable to analyze wallet' },
        { status: 404 }
      );
    }

    const walletData = result.data;
    const risk = calculateWalletRisk(walletData);
    
    // Check if this is a contract address
    const isContract = walletData.contract_address === '1';

    const response = {
      address: address.toLowerCase(),
      chain: getChainName(chainId),
      chainId,
      
      // Risk assessment
      riskScore: risk.score,
      riskLevel: risk.level,
      risks: risk.risks,
      riskCategories: risk.categories,
      
      // Address type
      addressType: isContract ? 'contract' : 'eoa',
      
      // Detailed flags
      details: {
        // Criminal activity
        hasStealingAttack: walletData.stealing_attack === '1',
        hasCybercrime: walletData.cybercrime === '1',
        hasPhishingActivity: walletData.phishing_activities === '1',
        
        // Financial crimes
        hasMoneyLaundering: walletData.money_laundering === '1',
        hasFinancialCrime: walletData.financial_crime === '1',
        
        // Other risks
        hasDarkwebTx: walletData.darkweb_transactions === '1',
        hasMaliciousMining: walletData.malicious_mining_activities === '1',
        isBlacklisted: walletData.blacklist_doubt === '1',
        isHoneypotRelated: walletData.honeypot_related_address === '1',
        hasFakeKYC: walletData.fake_kyc === '1',
      },
      
      // Summary
      summary: risk.score === 0 
        ? 'No known risks detected' 
        : `${risk.risks.length} risk indicator(s) found`,
      
      // Meta
      cached: result.cached,
      source: 'GoPlus Security API',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Wallet risk check failed:', error);
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
    description: 'Wallet risk assessment including blacklist, phishing, and criminal activity checks'
  },
  handler
);

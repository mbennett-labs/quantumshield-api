// ===========================================
// QUANTUMSHIELD API - DATA SOURCES
// ===========================================
// Centralized API fetching with caching
// Prevents duplicate API calls across endpoints

import { cache, CACHE_TTL, cacheKey } from './cache';

// ===========================================
// API ENDPOINTS
// ===========================================
const GOPLUS_TOKEN_API = 'https://api.gopluslabs.io/api/v1/token_security';
const GOPLUS_ADDRESS_API = 'https://api.gopluslabs.io/api/v1/address_security';
const HONEYPOT_API = 'https://api.honeypot.is/v2/IsHoneypot';

// ===========================================
// CHAIN CONFIGURATION
// ===========================================
export const CHAIN_IDS: Record<string, string> = {
  'ethereum': '1',
  'eth': '1',
  'bsc': '56',
  'base': '8453',
  'arbitrum': '42161',
  'polygon': '137',
};

// Chains supported by Honeypot.is
const HONEYPOT_SUPPORTED_CHAINS = ['1', '56', '8453'];

// ===========================================
// TYPE DEFINITIONS
// ===========================================
export interface GoPlusTokenData {
  token_name?: string;
  token_symbol?: string;
  total_supply?: string;
  holder_count?: string;
  lp_holder_count?: string;
  
  // Security flags
  is_honeypot?: string;
  is_open_source?: string;
  is_proxy?: string;
  is_mintable?: string;
  is_blacklisted?: string;
  is_whitelisted?: string;
  is_anti_whale?: string;
  
  // Ownership
  can_take_back_ownership?: string;
  owner_change_balance?: string;
  hidden_owner?: string;
  creator_address?: string;
  owner_address?: string;
  
  // Trading
  buy_tax?: string;
  sell_tax?: string;
  cannot_buy?: string;
  cannot_sell_all?: string;
  trading_cooldown?: string;
  selfdestruct?: string;
  external_call?: string;
  
  // Holders & LP
  holders?: Array<{
    address: string;
    percent: string;
    is_contract: number;
    is_locked: number;
    tag?: string;
  }>;
  lp_holders?: Array<{
    address: string;
    percent: string;
    is_contract: number;
    is_locked: number;
    tag?: string;
  }>;
  dex?: Array<{
    name: string;
    pair?: string;
    liquidity?: string;
    liquidity_type?: string;
  }>;
}

export interface GoPlusAddressData {
  blacklist_doubt?: string;
  honeypot_related_address?: string;
  phishing_activities?: string;
  stealing_attack?: string;
  fake_kyc?: string;
  malicious_mining_activities?: string;
  darkweb_transactions?: string;
  cybercrime?: string;
  money_laundering?: string;
  financial_crime?: string;
  contract_address?: string;
}

export interface HoneypotData {
  honeypotResult?: {
    isHoneypot: boolean;
  };
  simulationResult?: {
    buyTax: number;
    sellTax: number;
    transferTax: number;
  };
  pair?: {
    liquidity: number;
  };
  riskLevel?: number;
}

export interface FetchResult<T> {
  data: T | null;
  cached: boolean;
  error?: string;
}

// ===========================================
// GOPLUS TOKEN SECURITY FETCHER
// ===========================================
export async function fetchGoPlusToken(
  address: string, 
  chainId: string
): Promise<FetchResult<GoPlusTokenData>> {
  const key = cacheKey('goplus:token', address, chainId);
  
  // Check cache first
  const cached = cache.get<GoPlusTokenData>(key);
  if (cached) {
    return { data: cached, cached: true };
  }
  
  try {
    const url = `${GOPLUS_TOKEN_API}/${chainId}?contract_addresses=${address}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`GoPlus Token API error: ${response.status}`);
      return { data: null, cached: false, error: `API returned ${response.status}` };
    }
    
    const json = await response.json();
    const data = json.result?.[address.toLowerCase()] as GoPlusTokenData | undefined;
    
    if (!data) {
      return { data: null, cached: false, error: 'Token not found' };
    }
    
    // Cache the result
    cache.set(key, data, CACHE_TTL.TOKEN_SECURITY);
    
    return { data, cached: false };
  } catch (error) {
    console.error('GoPlus Token fetch failed:', error);
    return { 
      data: null, 
      cached: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// ===========================================
// GOPLUS ADDRESS SECURITY FETCHER
// ===========================================
export async function fetchGoPlusAddress(
  address: string,
  chainId: string
): Promise<FetchResult<GoPlusAddressData>> {
  const key = cacheKey('goplus:address', address, chainId);
  
  // Check cache first
  const cached = cache.get<GoPlusAddressData>(key);
  if (cached) {
    return { data: cached, cached: true };
  }
  
  try {
    const url = `${GOPLUS_ADDRESS_API}/${address}?chain_id=${chainId}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`GoPlus Address API error: ${response.status}`);
      return { data: null, cached: false, error: `API returned ${response.status}` };
    }
    
    const json = await response.json();
    const data = json.result as GoPlusAddressData | undefined;
    
    if (!data) {
      return { data: null, cached: false, error: 'Address not found' };
    }
    
    // Cache the result (shorter TTL for wallet data)
    cache.set(key, data, CACHE_TTL.WALLET_RISK);
    
    return { data, cached: false };
  } catch (error) {
    console.error('GoPlus Address fetch failed:', error);
    return { 
      data: null, 
      cached: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// ===========================================
// HONEYPOT.IS FETCHER
// ===========================================
export async function fetchHoneypot(
  address: string,
  chainId: string
): Promise<FetchResult<HoneypotData>> {
  // Only supported on certain chains
  if (!HONEYPOT_SUPPORTED_CHAINS.includes(chainId)) {
    return { data: null, cached: false, error: 'Chain not supported by Honeypot.is' };
  }
  
  const key = cacheKey('honeypot', address, chainId);
  
  // Check cache first
  const cached = cache.get<HoneypotData>(key);
  if (cached) {
    return { data: cached, cached: true };
  }
  
  try {
    const url = `${HONEYPOT_API}?address=${address}&chainId=${chainId}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      return { data: null, cached: false, error: `API returned ${response.status}` };
    }
    
    const data = await response.json() as HoneypotData;
    
    // Cache the result
    cache.set(key, data, CACHE_TTL.HONEYPOT);
    
    return { data, cached: false };
  } catch (error) {
    console.error('Honeypot.is fetch failed:', error);
    return { 
      data: null, 
      cached: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// ===========================================
// VALIDATION HELPERS
// ===========================================
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function normalizeChainId(chain: string): string {
  return CHAIN_IDS[chain.toLowerCase()] || chain;
}

export function getChainName(chainId: string): string {
  const chainNames: Record<string, string> = {
    '1': 'ethereum',
    '56': 'bsc',
    '8453': 'base',
    '42161': 'arbitrum',
    '137': 'polygon',
  };
  return chainNames[chainId] || chainId;
}

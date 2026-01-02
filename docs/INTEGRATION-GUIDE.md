# QuantumShield API - Developer Integration Guide

## Table of Contents
- [Getting Started](#getting-started)
- [Authentication (x402)](#authentication-x402)
- [Code Examples](#code-examples)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)
- [Rate Limits](#rate-limits)

---

## Getting Started

### Base URL
```
https://quantumshield-api.vercel.app
```

### Quick Test (Demo Mode)
Add `?demo=true` to any endpoint to get sample data without payment:

```bash
curl "https://quantumshield-api.vercel.app/api/token/security?address=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913&chain=base&demo=true"
```

---

## Authentication (x402)

QuantumShield uses the x402 protocol for payment. No API keys needed!

### Flow
1. Make request → Get `402 Payment Required`
2. Sign payment with wallet
3. Retry with `X-Payment` header
4. Receive data ✅

### 402 Response Structure
```json
{
  "x402Version": 1,
  "accepts": [
    {
      "scheme": "exact",
      "network": "base",
      "maxAmountRequired": "0.002",
      "asset": "USDC",
      "payTo": "0x7d9ea6549d5b86ef07b9fa2f1cbac52fc523df65",
      "description": "Token security analysis",
      "maxTimeoutSeconds": 60
    }
  ],
  "facilitatorUrl": "https://x402.org/facilitator"
}
```

---

## Code Examples

### JavaScript/TypeScript (with @x402/fetch)

```typescript
import { createX402Client } from '@x402/fetch';
import { createWalletClient, http } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

// Setup wallet
const account = privateKeyToAccount('0x...');
const wallet = createWalletClient({
  account,
  chain: base,
  transport: http(),
});

// Create x402 client
const client = createX402Client({ wallet });

// Make authenticated request
async function checkToken(address: string, chain: string = 'base') {
  const url = `https://quantumshield-api.vercel.app/api/token/security?address=${address}&chain=${chain}`;
  
  const response = await client.fetch(url);
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return response.json();
}

// Usage
const result = await checkToken('0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913');
console.log(`Risk Score: ${result.riskScore} (${result.riskLevel})`);
```

### JavaScript (Manual x402 Flow)

```javascript
async function checkTokenManual(address, chain = 'base') {
  const baseUrl = 'https://quantumshield-api.vercel.app';
  const endpoint = `/api/token/security?address=${address}&chain=${chain}`;
  
  // Step 1: Get payment requirements
  const initialResponse = await fetch(baseUrl + endpoint);
  
  if (initialResponse.status !== 402) {
    // Already paid or demo mode
    return initialResponse.json();
  }
  
  const paymentInfo = await initialResponse.json();
  
  // Step 2: Sign payment (using your wallet library)
  const payment = await signPayment(paymentInfo.accepts[0]);
  
  // Step 3: Retry with payment header
  const response = await fetch(baseUrl + endpoint, {
    headers: {
      'X-Payment': payment,
    },
  });
  
  return response.json();
}
```

### Python

```python
import requests

BASE_URL = "https://quantumshield-api.vercel.app"

def check_token(address: str, chain: str = "base", demo: bool = True) -> dict:
    """
    Check token security.
    Set demo=False and provide x402 payment for production use.
    """
    params = {
        "address": address,
        "chain": chain,
    }
    
    if demo:
        params["demo"] = "true"
    
    response = requests.get(f"{BASE_URL}/api/token/security", params=params)
    
    if response.status_code == 402:
        # Handle x402 payment (implement your payment logic)
        payment_info = response.json()
        raise Exception(f"Payment required: {payment_info['accepts'][0]['maxAmountRequired']} USDC")
    
    response.raise_for_status()
    return response.json()

# Usage
result = check_token("0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913")
print(f"Risk Score: {result['riskScore']} ({result['riskLevel']})")
print(f"Risks: {result['risks']}")
print(f"Warnings: {result['warnings']}")
```

### cURL Examples

```bash
# Token Security (demo)
curl "https://quantumshield-api.vercel.app/api/token/security?address=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913&chain=base&demo=true"

# Honeypot Check (demo)
curl "https://quantumshield-api.vercel.app/api/honeypot/check?address=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913&chain=base&demo=true"

# Wallet Risk (demo)
curl "https://quantumshield-api.vercel.app/api/wallet/risk?address=0x7d9ea6549d5b86ef07b9fa2f1cbac52fc523df65&chain=ethereum&demo=true"

# Contract Audit (demo)
curl "https://quantumshield-api.vercel.app/api/contract/audit?address=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913&chain=base&demo=true"

# Liquidity Check (demo)
curl "https://quantumshield-api.vercel.app/api/liquidity/check?address=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913&chain=base&demo=true"

# Whale Activity (demo)
curl "https://quantumshield-api.vercel.app/api/whale/activity?address=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913&chain=base&demo=true"

# Pair Analysis (demo)
curl "https://quantumshield-api.vercel.app/api/pair/analysis?address=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913&chain=base&demo=true"
```

### AI Agent Integration (LangChain)

```python
from langchain.tools import Tool
import requests

def token_security_tool(address: str) -> str:
    """Check if a token is safe to trade."""
    response = requests.get(
        "https://quantumshield-api.vercel.app/api/token/security",
        params={"address": address, "chain": "base", "demo": "true"}
    )
    data = response.json()
    
    return f"""
    Token: {data.get('name', 'Unknown')} ({data.get('symbol', '?')})
    Risk Score: {data['riskScore']}/100 ({data['riskLevel']})
    Risks: {', '.join(data['risks']) or 'None'}
    Warnings: {', '.join(data['warnings']) or 'None'}
    """

# Create LangChain tool
security_tool = Tool(
    name="TokenSecurity",
    description="Check if a cryptocurrency token is safe. Input: token contract address",
    func=token_security_tool,
)
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Parse JSON response |
| 400 | Bad Request | Check address format |
| 402 | Payment Required | Sign x402 payment |
| 404 | Not Found | Token/address not found on chain |
| 500 | Server Error | Retry or contact support |

### Error Response Format
```json
{
  "error": "Missing required parameter: address"
}
```

### Handling Errors (JavaScript)
```javascript
async function safeCheck(address, chain) {
  try {
    const response = await fetch(`${BASE_URL}/api/token/security?address=${address}&chain=${chain}&demo=true`);
    
    if (response.status === 400) {
      const { error } = await response.json();
      throw new Error(`Invalid request: ${error}`);
    }
    
    if (response.status === 404) {
      return { found: false, message: 'Token not found on this chain' };
    }
    
    if (response.status === 402) {
      const paymentInfo = await response.json();
      throw new Error(`Payment required: ${paymentInfo.accepts[0].maxAmountRequired} USDC`);
    }
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return { found: true, data: await response.json() };
    
  } catch (error) {
    console.error('Check failed:', error.message);
    return { found: false, error: error.message };
  }
}
```

---

## Best Practices

### 1. Use Caching
Responses include a `cached` field. Consider caching on your end too:
```javascript
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getCachedResult(address, chain) {
  const key = `${chain}:${address.toLowerCase()}`;
  const cached = cache.get(key);
  
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return cached.data;
  }
  
  const data = await checkToken(address, chain);
  cache.set(key, { data, time: Date.now() });
  return data;
}
```

### 2. Validate Addresses Before Calling
```javascript
function isValidAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

if (!isValidAddress(userInput)) {
  throw new Error('Invalid address format');
}
```

### 3. Use Appropriate Endpoints
| Need | Endpoint | Why |
|------|----------|-----|
| Quick honeypot check | `/api/honeypot/check` | Cheapest ($0.001) |
| Full token analysis | `/api/token/security` | Comprehensive |
| Before buying unknown token | `/api/contract/audit` | Most detailed |
| Check if wallet is scammer | `/api/wallet/risk` | Wallet-specific |
| Check liquidity safety | `/api/liquidity/check` | Rug pull focus |

### 4. Interpret Risk Scores

| Score | Level | Recommendation |
|-------|-------|----------------|
| 0-24 | LOW | Generally safe |
| 25-49 | MEDIUM | Review warnings |
| 50-69 | HIGH | Proceed with caution |
| 70-100 | CRITICAL | Avoid |

---

## Rate Limits

- **Underlying APIs:** ~30 requests/minute (GoPlus)
- **Caching:** 5-minute cache reduces actual API calls
- **Recommendation:** Max 10 requests/minute to stay safe

### Handling Rate Limits
```javascript
async function checkWithRetry(address, chain, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await checkToken(address, chain);
    } catch (error) {
      if (error.message.includes('rate limit') && i < maxRetries - 1) {
        await new Promise(r => setTimeout(r, 2000 * (i + 1)));
        continue;
      }
      throw error;
    }
  }
}
```

---

## Support

- **Issues:** Open a GitHub issue
- **x402 Help:** [x402.org](https://x402.org)
- **Data Sources:** [GoPlus Security](https://gopluslabs.io)

---

## Changelog

### v1.1.0 (January 2025)
- Added multi-source data aggregation (GoPlus + Honeypot.is)
- Implemented 5-minute caching
- Fixed syntax errors in 3 endpoints
- Added `cached` field to all responses
- Improved error messages

### v1.0.0 (December 2024)
- Initial release
- 7 security endpoints
- x402 payment integration

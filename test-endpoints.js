#!/usr/bin/env node

/**
 * QuantumShield API - Endpoint Test Script
 * 
 * Run with: node test-endpoints.js
 * Or: npx ts-node test-endpoints.ts
 * 
 * Tests all 7 endpoints in demo mode (no payment required)
 */

const BASE_URL = process.env.API_URL || 'https://quantumshield-api.vercel.app';

// Test addresses (well-known tokens)
const TEST_ADDRESSES = {
  // USDC on Base - safe, verified token
  safe: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  // A wallet address for wallet risk testing
  wallet: '0x7d9ea6549d5b86ef07b9fa2f1cbac52fc523df65',
};

const ENDPOINTS = [
  {
    name: 'Token Security',
    path: '/api/token/security',
    params: { address: TEST_ADDRESSES.safe, chain: 'base' },
    expectedFields: ['riskScore', 'riskLevel', 'risks', 'metrics'],
  },
  {
    name: 'Honeypot Check',
    path: '/api/honeypot/check',
    params: { address: TEST_ADDRESSES.safe, chain: 'base' },
    expectedFields: ['isHoneypot', 'status', 'taxes', 'flags'],
  },
  {
    name: 'Wallet Risk',
    path: '/api/wallet/risk',
    params: { address: TEST_ADDRESSES.wallet, chain: 'ethereum' },
    expectedFields: ['riskScore', 'riskLevel', 'details'],
  },
  {
    name: 'Contract Audit',
    path: '/api/contract/audit',
    params: { address: TEST_ADDRESSES.safe, chain: 'base' },
    expectedFields: ['securityScore', 'grade', 'auditFlags', 'contractDetails'],
  },
  {
    name: 'Liquidity Check',
    path: '/api/liquidity/check',
    params: { address: TEST_ADDRESSES.safe, chain: 'base' },
    expectedFields: ['rugPullRisk', 'riskLevel', 'liquidity'],
  },
  {
    name: 'Whale Activity',
    path: '/api/whale/activity',
    params: { address: TEST_ADDRESSES.safe, chain: 'base' },
    expectedFields: ['concentrationRisk', 'holderStats', 'topHolders'],
  },
  {
    name: 'Pair Analysis',
    path: '/api/pair/analysis',
    params: { address: TEST_ADDRESSES.safe, chain: 'base' },
    expectedFields: ['safetyScore', 'safetyGrade', 'pairs', 'trading'],
  },
];

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

async function testEndpoint(endpoint) {
  const params = new URLSearchParams({
    ...endpoint.params,
    demo: 'true', // Use demo mode for testing
  });
  
  const url = `${BASE_URL}${endpoint.path}?${params}`;
  
  console.log(`\n${colors.cyan}Testing: ${endpoint.name}${colors.reset}`);
  console.log(`${colors.dim}${url}${colors.reset}`);
  
  const startTime = Date.now();
  
  try {
    const response = await fetch(url);
    const latency = Date.now() - startTime;
    
    if (!response.ok) {
      const error = await response.json();
      console.log(`${colors.red}✗ FAILED${colors.reset} - Status: ${response.status}`);
      console.log(`  Error: ${error.error || 'Unknown error'}`);
      return { success: false, endpoint: endpoint.name, error: error.error };
    }
    
    const data = await response.json();
    
    // Check expected fields
    const missingFields = endpoint.expectedFields.filter(
      field => !(field in data)
    );
    
    if (missingFields.length > 0) {
      console.log(`${colors.yellow}⚠ WARNING${colors.reset} - Missing fields: ${missingFields.join(', ')}`);
      return { success: false, endpoint: endpoint.name, error: `Missing: ${missingFields.join(', ')}` };
    }
    
    console.log(`${colors.green}✓ PASSED${colors.reset} - ${latency}ms`);
    
    // Show key data points
    if (data.riskScore !== undefined) {
      console.log(`  Risk Score: ${data.riskScore} (${data.riskLevel || 'N/A'})`);
    }
    if (data.securityScore !== undefined) {
      console.log(`  Security Score: ${data.securityScore} (Grade: ${data.grade})`);
    }
    if (data.safetyScore !== undefined) {
      console.log(`  Safety Score: ${data.safetyScore} (${data.safetyGrade})`);
    }
    if (data.isHoneypot !== undefined) {
      console.log(`  Is Honeypot: ${data.isHoneypot} (${data.status})`);
    }
    if (data.cached !== undefined) {
      console.log(`  Cached: ${data.cached}`);
    }
    
    return { success: true, endpoint: endpoint.name, latency };
    
  } catch (error) {
    console.log(`${colors.red}✗ ERROR${colors.reset} - ${error.message}`);
    return { success: false, endpoint: endpoint.name, error: error.message };
  }
}

async function testx402Response(endpoint) {
  // Test that we get a proper 402 response without demo mode
  const params = new URLSearchParams(endpoint.params);
  const url = `${BASE_URL}${endpoint.path}?${params}`;
  
  try {
    const response = await fetch(url);
    
    if (response.status === 402) {
      const data = await response.json();
      if (data.x402Version && data.accepts && data.facilitatorUrl) {
        return { success: true, has402: true };
      }
    }
    return { success: false, has402: false };
  } catch {
    return { success: false, has402: false };
  }
}

async function runTests() {
  console.log('═'.repeat(60));
  console.log(`${colors.cyan}QuantumShield API - Endpoint Test Suite${colors.reset}`);
  console.log('═'.repeat(60));
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Test Mode: Demo (no payment required)`);
  console.log(`Endpoints: ${ENDPOINTS.length}`);
  
  const results = [];
  
  // Test all endpoints
  for (const endpoint of ENDPOINTS) {
    const result = await testEndpoint(endpoint);
    results.push(result);
  }
  
  // Test x402 response
  console.log(`\n${colors.cyan}Testing x402 Payment Response${colors.reset}`);
  const x402Result = await testx402Response(ENDPOINTS[0]);
  if (x402Result.has402) {
    console.log(`${colors.green}✓ Proper 402 response with x402 schema${colors.reset}`);
  } else {
    console.log(`${colors.yellow}⚠ Could not verify 402 response${colors.reset}`);
  }
  
  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log(`${colors.cyan}TEST SUMMARY${colors.reset}`);
  console.log('═'.repeat(60));
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  
  if (failed > 0) {
    console.log(`\n${colors.red}Failed Tests:${colors.reset}`);
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.endpoint}: ${r.error}`);
    });
  }
  
  // Average latency
  const latencies = results.filter(r => r.latency).map(r => r.latency);
  if (latencies.length > 0) {
    const avgLatency = Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length);
    console.log(`\nAverage Latency: ${avgLatency}ms`);
  }
  
  console.log('\n' + '═'.repeat(60));
  
  // Exit code
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(console.error);

// ===========================================
// QUANTUMSHIELD API - x402 PAYMENT WRAPPER
// ===========================================
// HTTP 402 Payment Required implementation
// https://www.x402.org/

import { NextRequest, NextResponse } from 'next/server';

// Your wallet address for receiving payments
const PAYEE_ADDRESS = '0x7d9ea6549d5b86ef07b9fa2f1cbac52fc523df65';

// x402 Facilitator URL
const FACILITATOR_URL = 'https://x402.org/facilitator';

// ===========================================
// TYPES
// ===========================================
export interface PaymentConfig {
  price: string;        // e.g., '0.002' (in USDC)
  network?: string;     // e.g., 'base'
  description: string;  // What the user is paying for
  asset?: string;       // Default: 'USDC'
}

type RouteHandler = (request: NextRequest) => Promise<NextResponse>;

// ===========================================
// x402 RESPONSE BUILDER
// ===========================================
function build402Response(config: PaymentConfig, requestUrl: string): NextResponse {
  // Remove $ if present in price and convert to atomic units
  const priceValue = config.price.replace('$', '');
  // Convert to atomic units (USDC has 6 decimals)
  const atomicUnits = String(Math.round(parseFloat(priceValue) * 1_000_000));
  
  const x402Response = {
    x402Version: 1,
    accepts: [
      {
        scheme: 'exact',
        network: config.network || 'base',
        maxAmountRequired: atomicUnits,  // ← FIXED: atomic units
        resource: requestUrl,
        description: config.description,
        mimeType: 'application/json',
        payTo: PAYEE_ADDRESS,
        maxTimeoutSeconds: 60,
        asset: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',  // ← FIXED: USDC contract address
        extra: {
          domain: {
            name: 'USD Coin',
            version: '2'
          }
        },  // ← FIXED: EIP-712 domain params
      },
    ],
    facilitatorUrl: FACILITATOR_URL,
  };
  
  return NextResponse.json(x402Response, { 
    status: 402,
    headers: {
      'X-Payment-Required': 'true',
      'X-Payment-Amount': atomicUnits,
      'X-Payment-Asset': '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      'X-Payment-Network': config.network || 'base',
    },
  });
}

// ===========================================
// PAYMENT WRAPPER
// ===========================================
/**
 * Wraps an API handler with x402 payment requirement
 * 
 * Usage:
 * ```
 * export const GET = withPayment(
 *   { price: '0.002', description: 'Token security analysis' },
 *   handler
 * );
 * ```
 */
export function withPayment(
  config: PaymentConfig,
  handler: RouteHandler
): RouteHandler {
  return async (request: NextRequest): Promise<NextResponse> => {
    const paymentHeader = request.headers.get('X-Payment');
    
    // Check for demo mode query parameter
    const isDemo = request.nextUrl.searchParams.get('demo') === 'true';
    
    if (!paymentHeader && !isDemo) {
      // No payment provided - return 402
      return build402Response(config, request.url);
    }
    
    if (isDemo) {
      // Demo mode - add flag to response
      const response = await handler(request);
      const data = await response.json();
      
      return NextResponse.json({
        ...data,
        _demo: true,
        _notice: 'Demo mode - sample data. Real API requires x402 payment.',
      });
    }
    
    // Payment header present - process request
    // Note: In production, you should verify the payment with the facilitator
    // For now, we trust that the facilitator has validated the payment
    
    try {
      const response = await handler(request);
      
      // Add payment confirmation headers
      return new NextResponse(response.body, {
        status: response.status,
        headers: {
          ...Object.fromEntries(response.headers.entries()),
          'X-Payment-Received': 'true',
          'X-Payment-Amount': config.price.replace('$', ''),
        },
      });
    } catch (error) {
      console.error('Handler error after payment:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

// ===========================================
// UTILITY EXPORTS
// ===========================================
export { PAYEE_ADDRESS, FACILITATOR_URL };

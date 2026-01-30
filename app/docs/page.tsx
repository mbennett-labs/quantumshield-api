import Image from "next/image";
import Link from "next/link";

function Logo({ size = 32 }: { size?: number }) {
  return (
    <Image
      src="/icon.png"
      alt="QuantumShield"
      width={size}
      height={size}
      className="rounded-lg"
    />
  );
}

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(0,255,136,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,136,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <Logo size={32} />
          <span className="font-semibold tracking-tight">QuantumShield</span>
        </Link>
        <div className="flex items-center gap-4 sm:gap-6 text-sm text-white/60">
          <Link href="/" className="hover:text-emerald-400 transition-colors">
            Home
          </Link>
          <Link href="/docs" className="text-emerald-400">
            Docs
          </Link>
          <a
            href="https://github.com/mbennett-labs/quantumshield-api"
            target="_blank"
            className="hidden sm:block px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
          >
            GitHub
          </a>
        </div>
      </nav>

      {/* Documentation Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-16">
        <h1 className="text-3xl sm:text-5xl font-bold mb-4">Documentation</h1>
        <p className="text-lg sm:text-xl text-white/50 mb-8 sm:mb-12">
          Complete guide to using the QuantumShield Security API with x402
          micropayments.
        </p>

        {/* Table of Contents */}
        <div className="p-4 sm:p-6 bg-white/[0.02] border border-white/5 rounded-xl mb-8 sm:mb-12">
          <h2 className="text-lg font-semibold mb-4">Table of Contents</h2>
          <ul className="space-y-2 text-white/60">
            <li>
              <a href="#overview" className="hover:text-emerald-400 transition-colors">
                1. Overview
              </a>
            </li>
            <li>
              <a href="#x402-flow" className="hover:text-emerald-400 transition-colors">
                2. How x402 Payments Work
              </a>
            </li>
            <li>
              <a href="#endpoints" className="hover:text-emerald-400 transition-colors">
                3. API Endpoints
              </a>
            </li>
            <li>
              <a href="#code-examples" className="hover:text-emerald-400 transition-colors">
                4. Code Examples
              </a>
            </li>
            <li>
              <a href="#faq" className="hover:text-emerald-400 transition-colors">
                5. FAQ
              </a>
            </li>
          </ul>
        </div>

        {/* Overview Section */}
        <section id="overview" className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-3">
            <span className="text-emerald-400">1.</span> Overview
          </h2>
          <div className="prose prose-invert max-w-none">
            <p className="text-white/70 leading-relaxed mb-4">
              QuantumShield API provides real-time security intelligence for
              blockchain tokens, wallets, and smart contracts. Built for AI
              agents and developers who need instant risk assessment without
              subscriptions or API keys.
            </p>
            <div className="grid sm:grid-cols-3 gap-4 mt-6">
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-lg">
                <div className="text-emerald-400 font-semibold mb-1">Base URL</div>
                <code className="text-sm text-white/60 break-all">
                  https://quantumshield-api.vercel.app
                </code>
              </div>
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-lg">
                <div className="text-emerald-400 font-semibold mb-1">
                  Payment Network
                </div>
                <code className="text-sm text-white/60">Base (Chain ID: 8453)</code>
              </div>
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-lg">
                <div className="text-emerald-400 font-semibold mb-1">
                  Payment Asset
                </div>
                <code className="text-sm text-white/60">USDC</code>
              </div>
            </div>
          </div>
        </section>

        {/* x402 Flow Section */}
        <section id="x402-flow" className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-3">
            <span className="text-emerald-400">2.</span> How x402 Payments Work
          </h2>
          <p className="text-white/70 mb-6">
            x402 is an open payment protocol that lets you pay per API request
            using stablecoins. No API keys, no subscriptions—just pay and use.
          </p>

          <div className="space-y-4 mb-8">
            {[
              { step: "1", title: "Make a Request", desc: "Call any endpoint without authentication" },
              { step: "2", title: "Receive 402 Response", desc: "Get payment details including price, network, and facilitator URL" },
              { step: "3", title: "Pay via Facilitator", desc: "Send USDC payment through x402.org facilitator on Base" },
              { step: "4", title: "Retry with Proof", desc: "Resend your request with X-Payment header containing payment proof" },
              { step: "5", title: "Get Data", desc: "Receive the security analysis data" },
            ].map((item) => (
              <div
                key={item.step}
                className="flex gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-lg"
              >
                <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-emerald-400 font-bold text-sm">{item.step}</span>
                </div>
                <div>
                  <div className="font-semibold">{item.title}</div>
                  <div className="text-sm text-white/50">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 sm:p-6 bg-black/50 border border-white/5 rounded-xl overflow-x-auto">
            <div className="text-white/40 text-sm mb-2"># Example 402 Response</div>
            <pre className="text-xs sm:text-sm text-emerald-400 whitespace-pre-wrap">{`{
  "error": "Payment Required",
  "message": "This endpoint requires $0.002 USDC payment",
  "paymentDetails": {
    "x402Version": 1,
    "accepts": [{
      "scheme": "exact",
      "network": "base",
      "maxAmountRequired": "0.002",
      "asset": "USDC",
      "payTo": "0x7d9ea6549d5b86ef07b9fa2f1cbac52fc523df65"
    }],
    "facilitatorUrl": "https://x402.org/facilitator"
  }
}`}</pre>
          </div>
        </section>

        {/* Endpoints Section */}
        <section id="endpoints" className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-3">
            <span className="text-emerald-400">3.</span> API Endpoints
          </h2>

          <EndpointDoc
            title="Token Security"
            price="$0.002"
            priceColor="emerald"
            endpoint="GET /api/token/security?address=<contract>&chain=<chain>"
            params={[
              { name: "address", desc: "Token contract address (required)", color: "emerald" },
              { name: "chain", desc: "Network: base, eth, bsc, polygon, arbitrum (default: base)", color: "emerald" },
            ]}
            returns={["Risk score (0-100)", "Risk level (LOW/MEDIUM/HIGH)", "Honeypot, tax, ownership flags"]}
          />

          <EndpointDoc
            title="Contract Audit"
            price="$0.003"
            priceColor="cyan"
            endpoint="GET /api/contract/audit?address=<contract>&chain=<chain>"
            params={[
              { name: "address", desc: "Contract address (required)", color: "cyan" },
              { name: "chain", desc: "Network (default: base)", color: "cyan" },
            ]}
            returns={["Security score & grade (A-F)", "Audit flags (proxy, selfdestruct, etc.)", "Ownership & trading risks"]}
          />

          <EndpointDoc
            title="Liquidity Check"
            price="$0.002"
            priceColor="emerald"
            endpoint="GET /api/liquidity/check?address=<contract>&chain=<chain>"
            params={[
              { name: "address", desc: "Token address (required)", color: "emerald" },
              { name: "chain", desc: "Network (default: base)", color: "emerald" },
            ]}
            returns={["Rug pull risk score", "LP lock percentage", "Top LP holders"]}
          />

          <EndpointDoc
            title="Wallet Risk"
            price="$0.002"
            priceColor="cyan"
            endpoint="GET /api/wallet/risk?address=<wallet>&chain=<chain_id>"
            params={[
              { name: "address", desc: "Wallet address (required)", color: "cyan" },
              { name: "chain", desc: "Chain ID (default: 1)", color: "cyan" },
            ]}
            returns={["Risk score & level", "Phishing, scam, blacklist flags", "Money laundering indicators"]}
          />

          <EndpointDoc
            title="Honeypot Check"
            price="$0.001"
            priceColor="emerald"
            endpoint="GET /api/honeypot/check?address=<contract>&chain=<chain>"
            params={[
              { name: "address", desc: "Token address (required)", color: "emerald" },
              { name: "chain", desc: "Network (default: base)", color: "emerald" },
            ]}
            returns={["Honeypot status (true/false)", "Buy/sell tax percentages", "Trading restriction flags"]}
          />

          <EndpointDoc
            title="Pair Analysis"
            price="$0.002"
            priceColor="cyan"
            endpoint="GET /api/pair/analysis?address=<contract>&chain=<chain>"
            params={[
              { name: "address", desc: "Token address (required)", color: "cyan" },
              { name: "chain", desc: "Network (default: base)", color: "cyan" },
            ]}
            returns={["Safety score & grade", "DEX pairs & liquidity", "Trading conditions"]}
          />

          <EndpointDoc
            title="Whale Activity"
            price="$0.002"
            priceColor="emerald"
            endpoint="GET /api/whale/activity?address=<contract>&chain=<chain>"
            params={[
              { name: "address", desc: "Token address (required)", color: "emerald" },
              { name: "chain", desc: "Network (default: base)", color: "emerald" },
            ]}
            returns={["Concentration risk score", "Top holders list", "Whale wallet analysis"]}
          />
        </section>

        {/* Code Examples Section */}
        <section id="code-examples" className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-3">
            <span className="text-emerald-400">4.</span> Code Examples
          </h2>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">cURL</h3>
            <div className="p-4 bg-black/50 border border-white/5 rounded-xl overflow-x-auto">
              <pre className="text-xs sm:text-sm text-emerald-400 whitespace-pre-wrap">{`# Step 1: Make initial request (will return 402)
curl https://quantumshield-api.vercel.app/api/token/security?address=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913&chain=base

# Step 2: After payment, retry with X-Payment header
curl -H "X-Payment: <payment-proof>" \\
  https://quantumshield-api.vercel.app/api/token/security?address=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913&chain=base`}</pre>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">JavaScript</h3>
            <div className="p-4 bg-black/50 border border-white/5 rounded-xl overflow-x-auto">
              <pre className="text-xs sm:text-sm text-cyan-400 whitespace-pre-wrap">{`const checkToken = async (address, chain = 'base') => {
  const url = \`https://quantumshield-api.vercel.app/api/token/security?address=\${address}&chain=\${chain}\`;

  // Initial request - will return 402
  const response = await fetch(url);

  if (response.status === 402) {
    const { paymentDetails } = await response.json();
    console.log('Payment required:', paymentDetails);

    // TODO: Process payment via x402 facilitator
    // const paymentProof = await processPayment(paymentDetails);

    // Retry with payment proof
    // const data = await fetch(url, {
    //   headers: { 'X-Payment': paymentProof }
    // });
  }

  return response.json();
};

// Usage
checkToken('0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', 'base');`}</pre>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Python</h3>
            <div className="p-4 bg-black/50 border border-white/5 rounded-xl overflow-x-auto">
              <pre className="text-xs sm:text-sm text-emerald-400 whitespace-pre-wrap">{`import requests

def check_token(address: str, chain: str = "base"):
    url = f"https://quantumshield-api.vercel.app/api/token/security"
    params = {"address": address, "chain": chain}

    # Initial request - will return 402
    response = requests.get(url, params=params)

    if response.status_code == 402:
        payment_details = response.json()["paymentDetails"]
        print(f"Payment required: {payment_details}")

        # TODO: Process payment via x402 facilitator
        # payment_proof = process_payment(payment_details)

        # Retry with payment proof
        # headers = {"X-Payment": payment_proof}
        # response = requests.get(url, params=params, headers=headers)

    return response.json()

# Usage
result = check_token("0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", "base")
print(result)`}</pre>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-3">
            <span className="text-emerald-400">5.</span> FAQ
          </h2>

          <div className="space-y-4">
            {[
              {
                q: "What is x402?",
                a: "x402 is an open payment protocol that enables pay-per-request API calls using cryptocurrency. It's based on HTTP 402 'Payment Required' status code, finally giving it a purpose after decades of being unused.",
              },
              {
                q: "Which chains are supported?",
                a: "We support Base, Ethereum, BSC, Polygon, and Arbitrum for token analysis. Payments are processed on Base using USDC.",
              },
              {
                q: "How do I get USDC on Base?",
                a: "You can bridge USDC from other chains using the official Base Bridge, or purchase directly through exchanges that support Base network.",
              },
              {
                q: "Do I need an API key?",
                a: "No! That's the beauty of x402. You pay per request with no signup, no API keys, and no subscriptions required.",
              },
              {
                q: "How fast are the responses?",
                a: "Once payment is verified, responses typically return within 1-2 seconds. The security data is fetched from GoPlus Security API in real-time.",
              },
              {
                q: "Can AI agents use this API?",
                a: "Yes! This API is specifically designed for AI agents. x402 enables autonomous agents to pay for services without human intervention.",
              },
              {
                q: "Where can I learn more about x402?",
                a: "Visit x402.org for the protocol specification, or check out x402scan.com to see live x402 transactions and services.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-4 sm:p-6 bg-white/[0.02] border border-white/5 rounded-xl"
              >
                <h3 className="font-semibold mb-2">{item.q}</h3>
                <p className="text-white/60 text-sm">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Help Section */}
        <section className="p-6 sm:p-8 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-2xl text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Need Help?</h2>
          <p className="text-white/60 mb-6">
            Check out our GitHub or reach out for support
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <a
              href="https://github.com/mbennett-labs/quantumshield-api"
              target="_blank"
              className="px-6 py-3 bg-white/10 border border-white/10 rounded-lg font-medium hover:bg-white/20 transition-colors"
            >
              View on GitHub
            </a>
            <a
              href="https://x402.org"
              target="_blank"
              className="px-6 py-3 bg-white/10 border border-white/10 rounded-lg font-medium hover:bg-white/20 transition-colors"
            >
              Learn x402
            </a>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="relative z-10 px-4 sm:px-8 py-8 sm:py-12 border-t border-white/5 mt-12 sm:mt-16">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white/40">
            <Logo size={24} />
            <span className="text-sm">Built by QuantumShieldLabs</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-white/40">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <a
              href="https://github.com/mbennett-labs"
              target="_blank"
              className="hover:text-white transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://x402.org"
              target="_blank"
              className="hover:text-white transition-colors"
            >
              x402 Protocol
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function EndpointDoc({
  title,
  price,
  priceColor,
  endpoint,
  params,
  returns,
}: {
  title: string;
  price: string;
  priceColor: "emerald" | "cyan";
  endpoint: string;
  params: { name: string; desc: string; color: "emerald" | "cyan" }[];
  returns: string[];
}) {
  const priceColorClass = priceColor === "emerald" ? "text-emerald-400" : "text-cyan-400";

  return (
    <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-white/[0.02] border border-white/5 rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg sm:text-xl font-semibold">{title}</h3>
        <span className={`${priceColorClass} font-mono`}>{price}</span>
      </div>
      <code className="block p-3 bg-black/50 rounded-lg text-xs sm:text-sm mb-4 overflow-x-auto">
        {endpoint}
      </code>
      <div className="grid sm:grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-white/40 mb-2">Parameters</div>
          <ul className="space-y-1 text-white/70">
            {params.map((p) => (
              <li key={p.name}>
                <code className={p.color === "emerald" ? "text-emerald-400" : "text-cyan-400"}>
                  {p.name}
                </code>{" "}
                - {p.desc}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-white/40 mb-2">Returns</div>
          <ul className="space-y-1 text-white/70">
            {returns.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

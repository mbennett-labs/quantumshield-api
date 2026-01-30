import Link from "next/link";

function Logo({ size = 32 }: { size?: number }) {
  return (
    <div
      className="bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-lg flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <span
        className="text-black font-bold"
        style={{ fontSize: size * 0.4 }}
      >
        QS
      </span>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(0,255,136,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,136,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Logo size={32} />
          <span className="font-semibold tracking-tight">QuantumShield</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 md:gap-6 text-sm text-white/60">
          <a href="#endpoints" className="hover:text-emerald-400 transition-colors">
            Endpoints
          </a>
          <Link href="/docs" className="hover:text-emerald-400 transition-colors">
            Docs
          </Link>
          <a href="#pricing" className="hover:text-emerald-400 transition-colors">
            Pricing
          </a>
          <a
            href="https://github.com/mbennett-labs/quantumshield-api"
            target="_blank"
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
          >
            GitHub
          </a>
        </div>
        {/* Mobile menu button */}
        <div className="sm:hidden flex items-center gap-4">
          <a
            href="https://github.com/mbennett-labs/quantumshield-api"
            target="_blank"
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-sm"
          >
            GitHub
          </a>
        </div>
      </nav>

      {/* Mobile Nav Links */}
      <div className="sm:hidden relative z-10 flex items-center justify-center gap-6 px-4 py-3 border-b border-white/5 text-sm text-white/60">
        <a href="#endpoints" className="hover:text-emerald-400 transition-colors">
          Endpoints
        </a>
        <Link href="/docs" className="hover:text-emerald-400 transition-colors">
          Docs
        </Link>
        <a href="#pricing" className="hover:text-emerald-400 transition-colors">
          Pricing
        </a>
      </div>

      {/* Hero Section */}
      <main className="relative z-10 px-4 sm:px-8 pt-12 sm:pt-24 pb-12 sm:pb-16 max-w-6xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs sm:text-sm mb-6 sm:mb-8">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          x402 Payments Live on Base
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-4 sm:mb-6">
          Security Intelligence
          <br />
          <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            for the Agentic Web
          </span>
        </h1>

        <p className="text-base sm:text-xl text-white/50 max-w-2xl mb-8 sm:mb-12 leading-relaxed">
          Token risk analysis, wallet reputation, and honeypot detection.
          Pay-per-request with USDC micropayments. Built for AI agents and
          developers.
        </p>

        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mb-12 sm:mb-16">
          <a
            href="#endpoints"
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg font-medium text-black hover:opacity-90 transition-opacity text-center"
          >
            View Endpoints
          </a>
          <a
            href="https://github.com/mbennett-labs/quantumshield-api"
            target="_blank"
            className="px-6 py-3 bg-white/5 border border-white/10 rounded-lg font-medium hover:bg-white/10 transition-colors text-center"
          >
            GitHub Repository
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 py-6 sm:py-8 border-y border-white/5">
          <div className="text-center sm:text-left">
            <div className="text-2xl sm:text-3xl font-bold text-emerald-400">$0.001</div>
            <div className="text-sm text-white/40 mt-1">Min request cost</div>
          </div>
          <div className="text-center sm:text-left">
            <div className="text-2xl sm:text-3xl font-bold text-cyan-400">Base</div>
            <div className="text-sm text-white/40 mt-1">Network</div>
          </div>
          <div className="text-center sm:text-left">
            <div className="text-2xl sm:text-3xl font-bold text-emerald-400">USDC</div>
            <div className="text-sm text-white/40 mt-1">Payment asset</div>
          </div>
        </div>
      </main>

      {/* Endpoints Section */}
      <section id="endpoints" className="relative z-10 px-4 sm:px-8 py-16 sm:py-24 max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">API Endpoints</h2>
        <p className="text-white/50 mb-8 sm:mb-12 max-w-xl">
          All endpoints return 402 Payment Required. Pay with USDC on Base via
          x402 protocol.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <EndpointCard
            icon={<ShieldIcon />}
            title="Token Security"
            description="Comprehensive risk analysis including honeypot detection, tax analysis, and contract flags."
            endpoint="/api/token/security"
            price="$0.002"
            color="emerald"
          />
          <EndpointCard
            icon={<CodeIcon />}
            title="Contract Audit"
            description="Deep smart contract analysis with security scoring, ownership risks, and trading restrictions."
            endpoint="/api/contract/audit"
            price="$0.003"
            color="cyan"
          />
          <EndpointCard
            icon={<WalletIcon />}
            title="Liquidity Check"
            description="LP lock status, rug pull risk scoring, and liquidity provider concentration analysis."
            endpoint="/api/liquidity/check"
            price="$0.002"
            color="emerald"
          />
          <EndpointCard
            icon={<CreditCardIcon />}
            title="Wallet Risk"
            description="Wallet reputation scoring for phishing, scams, money laundering, and blacklist status."
            endpoint="/api/wallet/risk"
            price="$0.002"
            color="cyan"
          />
          <EndpointCard
            icon={<AlertIcon />}
            title="Honeypot Check"
            description="Quick honeypot detection with buy/sell tax analysis and trading restriction flags."
            endpoint="/api/honeypot/check"
            price="$0.001"
            color="emerald"
          />
          <EndpointCard
            icon={<SwapIcon />}
            title="Pair Analysis"
            description="DEX pair safety metrics, liquidity depth, and trading condition analysis."
            endpoint="/api/pair/analysis"
            price="$0.002"
            color="cyan"
          />
          <div className="sm:col-span-2 lg:col-span-1 lg:col-start-2">
            <EndpointCard
              icon={<ChartIcon />}
              title="Whale Activity"
              description="Large holder concentration, top wallet analysis, and manipulation risk scoring."
              endpoint="/api/whale/activity"
              price="$0.002"
              color="emerald"
            />
          </div>
        </div>
      </section>

      {/* How x402 Works Section */}
      <section id="pricing" className="relative z-10 px-4 sm:px-8 py-16 sm:py-24 max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">How x402 Works</h2>
        <p className="text-white/50 mb-8 sm:mb-12 max-w-xl">
          Native HTTP payments. No API keys. No subscriptions. Just pay and use.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {[
            { step: "01", title: "Request", desc: "Call any endpoint" },
            { step: "02", title: "402 Response", desc: "Receive payment details" },
            { step: "03", title: "Pay USDC", desc: "Send micropayment on Base" },
            { step: "04", title: "Get Data", desc: "Receive security analysis" },
          ].map((item) => (
            <div
              key={item.step}
              className="p-4 sm:p-6 bg-white/[0.02] border border-white/5 rounded-xl"
            >
              <div className="text-emerald-400 font-mono text-sm mb-2">{item.step}</div>
              <div className="font-semibold mb-1 text-sm sm:text-base">{item.title}</div>
              <div className="text-xs sm:text-sm text-white/40">{item.desc}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 sm:mt-12 p-4 sm:p-6 bg-black/50 border border-white/5 rounded-xl font-mono text-xs sm:text-sm overflow-x-auto">
          <div className="text-white/40 mb-2"># Example request</div>
          <div className="text-emerald-400 break-all">
            curl https://quantumshield-api.vercel.app/api/token/security?address=0x...&chain=base
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-4 sm:px-8 py-8 sm:py-12 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white/40">
            <Logo size={24} />
            <span className="text-sm">Built by QuantumShieldLabs</span>
          </div>
          <div className="flex items-center gap-4 sm:gap-6 text-sm text-white/40">
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

function EndpointCard({
  icon,
  title,
  description,
  endpoint,
  price,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  endpoint: string;
  price: string;
  color: "emerald" | "cyan";
}) {
  const colorClasses = {
    emerald: {
      border: "hover:border-emerald-500/30",
      bg: "bg-emerald-500/10 group-hover:bg-emerald-500/20",
      text: "text-emerald-400",
    },
    cyan: {
      border: "hover:border-cyan-500/30",
      bg: "bg-cyan-500/10 group-hover:bg-cyan-500/20",
      text: "text-cyan-400",
    },
  };

  return (
    <div
      className={`group p-4 sm:p-6 bg-white/[0.02] border border-white/5 rounded-2xl ${colorClasses[color].border} transition-colors`}
    >
      <div
        className={`w-10 h-10 sm:w-12 sm:h-12 ${colorClasses[color].bg} rounded-xl flex items-center justify-center mb-3 sm:mb-4 transition-colors`}
      >
        <div className={colorClasses[color].text}>{icon}</div>
      </div>
      <h3 className="text-base sm:text-lg font-semibold mb-2">{title}</h3>
      <p className="text-xs sm:text-sm text-white/40 mb-3 sm:mb-4">{description}</p>
      <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-white/5">
        <code className="text-xs text-white/30">{endpoint}</code>
        <span className={`${colorClasses[color].text} font-mono text-xs sm:text-sm`}>
          {price}
        </span>
      </div>
    </div>
  );
}

// Icons
function ShieldIcon() {
  return (
    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
      />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
      />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
      />
    </svg>
  );
}

function CreditCardIcon() {
  return (
    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3"
      />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
      />
    </svg>
  );
}

function SwapIcon() {
  return (
    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
      />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
      />
    </svg>
  );
}

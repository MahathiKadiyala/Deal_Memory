import React from 'react'
import { Link } from 'react-router-dom'
import {
  Brain,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Sparkles,
  ShieldCheck,
  FileText,
  Users,
  Compass,
  Zap,
} from 'lucide-react'

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-500/20 selection:text-indigo-800">
      {/* Sticky Clean Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-1 ring-black/5">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-900">DealMemory</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                AI Sales Agent
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#product" className="hover:text-indigo-600 transition-colors">
              Product
            </a>
            <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">
              How It Works
            </a>
            <a href="#memory" className="hover:text-indigo-600 transition-colors">
              Memory Loop
            </a>
            <a href="#comparison" className="hover:text-indigo-600 transition-colors">
              Differentiator
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-semibold text-slate-700 hover:text-slate-900 px-3.5 py-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 rounded-xl shadow-md shadow-indigo-600/25 transition-all flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden bg-gradient-to-b from-indigo-50/40 via-white to-white">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Hero Text (7 cols) */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80 text-xs font-bold tracking-wide">
                <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                <span>AI Sales Intelligence Agent</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                Your AI Sales Agent <br className="hidden sm:inline" />
                That <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-800">Remembers.</span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
                DealMemory remembers what worked, what failed, and what matters across every customer interaction — so your next conversation starts with experience, not a blank slate.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  to="/signup"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <span>Try DealMemory</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#how-it-works"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-sm shadow-xs transition-all flex items-center justify-center gap-2"
                >
                  <span>See How It Works</span>
                </a>
              </div>

              <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs font-semibold text-slate-500">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Enterprise Experience Memory</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <span>Instant Deal Briefings</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Card (5 cols) - Recreating the Reference Screen 1 Visual */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4">
                {/* Visual Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                      AC
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">Acme Corp</div>
                      <div className="text-[11px] text-slate-500">Enterprise Opportunity · $85,000</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    Negotiation
                  </span>
                </div>

                {/* Experience items */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-emerald-950">What Worked:</span>
                      <p className="text-slate-600 text-[11px] mt-0.5">
                        ROI / Payback framing generated immediate CFO engagement.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-rose-50/70 border border-rose-200/80">
                    <XCircle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-rose-950">What Failed:</span>
                      <p className="text-slate-600 text-[11px] mt-0.5">
                        Discount-first approach lowered perceived value and stalled talks.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <Users className="h-4 w-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900">Key Stakeholders:</span>
                      <p className="text-slate-600 text-[11px] mt-0.5">
                        Sarah Chen (CFO, price-sensitive) · Michael Lee (Champion)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Briefing recommendation badge */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-900 to-slate-900 text-white shadow-md flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-300" />
                    <span className="text-xs font-semibold">Recommended Approach</span>
                  </div>
                  <span className="text-xs font-bold text-indigo-200">Lead with ROI</span>
                </div>
              </div>
            </div>
          </div>

          {/* Process 4-Step Cards Bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm text-center space-y-2 hover:border-indigo-300 transition-all">
              <div className="w-10 h-10 mx-auto rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                01
              </div>
              <h4 className="text-sm font-bold text-slate-900">Remember</h4>
              <p className="text-xs text-slate-500">Capture every interaction and nuance seamlessly.</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm text-center space-y-2 hover:border-indigo-300 transition-all">
              <div className="w-10 h-10 mx-auto rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                02
              </div>
              <h4 className="text-sm font-bold text-slate-900">Learn</h4>
              <p className="text-xs text-slate-500">Isolate what strategies won and what failed.</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm text-center space-y-2 hover:border-indigo-300 transition-all">
              <div className="w-10 h-10 mx-auto rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold text-sm">
                03
              </div>
              <h4 className="text-sm font-bold text-slate-900">Recall</h4>
              <p className="text-xs text-slate-500">Retrieve relevant deal memories right before calls.</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm text-center space-y-2 hover:border-indigo-300 transition-all">
              <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                04
              </div>
              <h4 className="text-sm font-bold text-slate-900">Adapt</h4>
              <p className="text-xs text-slate-500">Make higher-probability recommendations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Differentiator Statement Section */}
      <section id="memory" className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
            The Core Paradigm Shift
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            "Most AI assistants remember the conversation. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-200">
              DealMemory remembers the experience."
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            CRMs log rows and basic notes. Generic copilot bots summarize transcripts. DealMemory extracts durability: what tactics resonated, which objections recur, and how stakeholders make decisions.
          </p>
        </div>
      </section>

      {/* Comparison Section (Traditional AI vs DealMemory) */}
      <section id="comparison" className="py-20 bg-[#F8FAFC]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 space-y-2">
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Built for Institutional Sales Memory
            </h3>
            <p className="text-sm text-slate-500">
              See why enterprise dealmakers choose experiential intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Traditional AI Box */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              <div className="pb-4 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Standard Tools
                </span>
                <h4 className="text-lg font-bold text-slate-700 mt-1">
                  Traditional AI Sales Assistant
                </h4>
              </div>
              <ul className="space-y-3.5 text-sm text-slate-600">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 flex-shrink-0" />
                  <span>Summarizes single calls into transcript blurbs</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 flex-shrink-0" />
                  <span>Stores static notes in fragmented CRM fields</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 flex-shrink-0" />
                  <span>Retrieves recent words without understanding cause and effect</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 flex-shrink-0" />
                  <span>Focuses strictly on what was said, not what worked</span>
                </li>
              </ul>
            </div>

            {/* DealMemory Box */}
            <div className="bg-white p-8 rounded-2xl border-2 border-indigo-600 shadow-xl shadow-indigo-600/10 space-y-5 relative">
              <div className="absolute -top-3 right-6 bg-indigo-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                Next-Gen Agent
              </div>
              <div className="pb-4 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  DealMemory
                </span>
                <h4 className="text-lg font-bold text-slate-900 mt-1">
                  Experiential Intelligence Agent
                </h4>
              </div>
              <ul className="space-y-3.5 text-sm text-slate-800 font-medium">
                <li className="flex items-start gap-2.5 text-indigo-950">
                  <CheckCircle2 className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                  <span>Remembers successful approaches across accounts</span>
                </li>
                <li className="flex items-start gap-2.5 text-indigo-950">
                  <CheckCircle2 className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                  <span>Remembers failed approaches so teams never repeat mistakes</span>
                </li>
                <li className="flex items-start gap-2.5 text-indigo-950">
                  <CheckCircle2 className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                  <span>Learns nuanced stakeholder preferences and objections</span>
                </li>
                <li className="flex items-start gap-2.5 text-indigo-950">
                  <CheckCircle2 className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                  <span>Connects outcomes across months of interactions</span>
                </li>
                <li className="flex items-start gap-2.5 text-indigo-950">
                  <CheckCircle2 className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                  <span>Adapts future deal preparation with tailored strategy briefings</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
              The Reality of B2B Sales
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Your CRM stores what happened. <br />
              DealMemory remembers what you learned.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-[#F8FAFC] border border-slate-200/90 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">1. Lost Knowledge</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Important deal experience gets buried across calls, emails, notes, and individual rep memory when people leave or change territories.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#F8FAFC] border border-slate-200/90 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <XCircle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">2. Repeated Mistakes</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Teams repeat approaches that previously failed because past conversation outcomes and buyer reactions are difficult to systematically recall.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#F8FAFC] border border-slate-200/90 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Compass className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">3. Missed Signals</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Stakeholder preferences, hidden objections, and buying signals are easily lost between multi-month conversation cycles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Case Section */}
      <section className="py-20 bg-[#F8FAFC] border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <h2 className="text-3xl font-extrabold text-slate-900">
              Built for complex B2B deals.
            </h2>
            <p className="text-sm text-slate-500">
              Empowering every layer of the revenue organization with compounding sales experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2">
              <h4 className="text-base font-bold text-slate-900">Account Executives</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Prepare for every important customer conversation with instant pre-call briefings that synthesize historical objections and winning tactics.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2">
              <h4 className="text-base font-bold text-slate-900">Sales Managers</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Understand which commercial framings and negotiation tactics actually work across deals, replacing rep guesswork with real evidence.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2">
              <h4 className="text-base font-bold text-slate-900">Revenue Teams</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Preserve institutional sales experience instead of watching valuable learnings vanish whenever individual team members move on.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white relative">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Turn every sales conversation into experience.
          </h2>
          <p className="text-base sm:text-lg text-indigo-200 max-w-xl mx-auto">
            Build institutional sales memory that gets more useful with every customer interaction.
          </p>
          <div className="pt-4">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-slate-950 hover:bg-slate-100 font-extrabold text-sm shadow-xl transition-all"
            >
              <span>Get Started</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
              <Brain className="h-4 w-4" />
            </div>
            <span className="text-base font-bold text-white tracking-tight">DealMemory</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-medium">
            <Link to="/dashboard" className="hover:text-white transition-colors">
              App Demo
            </Link>
            <Link to="/deals" className="hover:text-white transition-colors">
              Deals
            </Link>
            <Link to="/memory" className="hover:text-white transition-colors">
              Memory Loop
            </Link>
            <Link to="/help" className="hover:text-white transition-colors">
              Help
            </Link>
            <Link to="/login" className="hover:text-white transition-colors">
              Sign In
            </Link>
          </div>

          <p className="text-xs text-slate-500">
            AI Sales Intelligence powered by experiential memory.
          </p>
        </div>
      </footer>
    </div>
  )
}

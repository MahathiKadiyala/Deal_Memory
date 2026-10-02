import React, { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Sparkles,
  Plus,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Brain,
  Layers,
  Calendar,
  DollarSign,
  Percent,
} from 'lucide-react'
import { Badge } from '../components/common/Badge'
import { Tabs } from '../components/common/Tabs'
import { DEMO_DEALS, DEMO_STAKEHOLDERS, DEMO_MEMORIES, DEMO_INTERACTIONS } from '../data/demoData'
import { DealBriefingModal } from '../components/deals/DealBriefingModal'
import { AddInteractionModal } from '../components/deals/AddInteractionModal'

export const DealDetailPage: React.FC = () => {
  const { dealId } = useParams<{ dealId: string }>()
  const [activeTab, setActiveTab] = useState('overview')
  const [briefingOpen, setBriefingOpen] = useState(false)
  const [addInteractionOpen, setAddInteractionOpen] = useState(false)

  // Find deal or fallback to Acme Corp
  const deal = DEMO_DEALS.find((d) => d.id === dealId) || DEMO_DEALS[0]
  const stakeholders = DEMO_STAKEHOLDERS.filter((s) => s.dealId === deal.id || s.dealId === 'acme')
  const memories = DEMO_MEMORIES.filter((m) => m.dealId === deal.id || m.dealId === 'acme')
  const interactions = DEMO_INTERACTIONS.filter((i) => i.dealId === deal.id || i.dealId === 'acme')

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'stakeholders', label: 'Stakeholders', badge: stakeholders.length },
    { id: 'memory', label: 'Memory', badge: memories.length },
    { id: 'interactions', label: 'Interactions', badge: interactions.length },
    { id: 'timeline', label: 'Timeline' },
  ]

  return (
    <div className="space-y-6">
      {/* Back to Deals Link */}
      <Link
        to="/deals"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Deals</span>
      </Link>

      {/* Main Deal Header (Matching Reference Screen 4) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-extrabold text-base flex items-center justify-center shadow-md shadow-indigo-600/20 flex-shrink-0">
            {deal.account.slice(0, 2).toUpperCase()}
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {deal.account}
              </h1>
              <Badge variant="warning">Negotiation</Badge>
              <Badge variant="danger">At Risk</Badge>
              <Badge variant="default">Enterprise</Badge>
            </div>
            <div className="text-xs text-slate-500 font-medium">
              <strong className="text-slate-800">${deal.value.toLocaleString()}</strong> —{' '}
              {deal.name}
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setBriefingOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-md shadow-indigo-600/25 transition-all"
          >
            <Sparkles className="h-4 w-4" />
            <span>Prepare Me for This Deal</span>
          </button>
          <button
            onClick={() => setAddInteractionOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-xs transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>+ Add Interaction</span>
          </button>
        </div>
      </div>

      {/* Top Highlights Grid (Stakeholders, Objections, Key Info) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1: Decision Maker */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-sm space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Decision Maker
          </span>
          <div className="flex items-center gap-3 pt-1">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80"
              alt="Sarah Chen"
              className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/20"
            />
            <div>
              <div className="text-xs font-bold text-slate-900">Sarah Chen</div>
              <div className="text-[11px] text-indigo-600 font-medium">CFO</div>
            </div>
          </div>
        </div>

        {/* Card 2: Champion */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-sm space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Champion
          </span>
          <div className="flex items-center gap-3 pt-1">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              alt="Michael Lee"
              className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/20"
            />
            <div>
              <div className="text-xs font-bold text-slate-900">Michael Lee</div>
              <div className="text-[11px] text-indigo-600 font-medium">VP Engineering</div>
            </div>
          </div>
        </div>

        {/* Card 3: Main Objection */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-rose-500 uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Main Objection
          </span>
          <div className="text-sm font-extrabold text-slate-900 pt-1">Pricing & Budget</div>
          <div className="text-[11px] text-slate-500">Comparing against low-end copilots</div>
        </div>

        {/* Card 4: Competitor & Signal */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Competitor In Play
          </span>
          <div className="text-sm font-extrabold text-slate-900 pt-1">Salesforce</div>
          <div className="text-[11px] text-emerald-600 font-semibold">Buying Signal: Strong ROI interest</div>
        </div>
      </div>

      {/* Deal Information KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm">
        <div>
          <span className="text-[11px] text-slate-400 font-medium">Deal Value</span>
          <div className="text-base font-extrabold text-slate-900 mt-0.5 flex items-center gap-1">
            <DollarSign className="h-4 w-4 text-slate-400" />
            <span>${deal.value.toLocaleString()}</span>
          </div>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 font-medium">Win Probability</span>
          <div className="text-base font-extrabold text-slate-900 mt-0.5 flex items-center gap-1">
            <Percent className="h-4 w-4 text-indigo-500" />
            <span>{deal.probability}%</span>
          </div>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 font-medium">Next Step</span>
          <div className="text-xs font-bold text-indigo-600 mt-1 truncate">
            {deal.nextActivity}
          </div>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 font-medium">Expected Close</span>
          <div className="text-xs font-bold text-slate-800 mt-1 flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>{deal.expectedClose}</span>
          </div>
        </div>
      </div>

      {/* Tabs Row */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 cols): What Worked / What Failed */}
          <div className="lg:col-span-2 space-y-6">
            {/* What Worked & What Failed Box (Matching Reference Screen 4 & 5) */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Deal Memory Summary</h3>
                <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full">
                  Experiential Intelligence
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* What Worked */}
                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>What Worked</span>
                  </div>
                  <div className="text-xs font-bold text-slate-900">ROI / Payback Analysis</div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Customer requested a follow-up specifically after viewing the 3-year payback model with cash flow impact.
                  </p>
                </div>

                {/* What Failed */}
                <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-800 uppercase tracking-wider">
                    <XCircle className="h-4 w-4 text-rose-600" />
                    <span>What Failed</span>
                  </div>
                  <div className="text-xs font-bold text-slate-900">Discount Offer</div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Customer rejected initial 10% discount concession and pushed for 25% lower commitment, stalling value conviction.
                  </p>
                </div>
              </div>

              {/* Customer Preferences Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Customer Preferences & Behavioral Norms
                </span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <span>Prefers data-driven discussions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <span>CFO focuses heavily on payback period</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <span>Engineering team cares deeply about API integration</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <span>Avoid aggressive discounting or arbitrary deadlines</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Current Situation & Strategy */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Current Deal Situation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Customer is evaluating pricing against perceived ROI. Sarah Chen requested hard justification before presenting to the board. Michael Lee is aligned on architecture.
              </p>
              <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200/70 text-xs text-indigo-950 font-medium flex items-center justify-between">
                <div>
                  <strong className="text-indigo-900">Recommended Next Step: </strong>
                  Prepare tailored ROI justification deck before the upcoming pricing discussion.
                </div>
                <button
                  onClick={() => setBriefingOpen(true)}
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg font-bold text-[11px] hover:bg-indigo-700 transition-colors flex-shrink-0 ml-3"
                >
                  Generate Briefing
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Quick Actions & Memory Stream (1 col) */}
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Quick Actions
              </span>
              <div className="space-y-2">
                <button
                  onClick={() => setBriefingOpen(true)}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Prepare Me for This Deal</span>
                </button>
                <button
                  onClick={() => setAddInteractionOpen(true)}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Interaction</span>
                </button>
                <button
                  onClick={() => setActiveTab('timeline')}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <Layers className="h-4 w-4" />
                  <span>View Timeline</span>
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3">
              <div className="flex items-center gap-2 text-indigo-400">
                <Brain className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Hindsight Memory</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                18 interactions retained for Acme Corp. Confidence score for ROI framing recommendation is 94%.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Stakeholders */}
      {activeTab === 'stakeholders' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stakeholders.map((s) => (
            <div
              key={s.id}
              className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4"
            >
              <div className="flex items-center gap-3.5">
                <img
                  src={s.avatar}
                  alt={s.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-500/20"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{s.name}</h4>
                  <div className="text-xs text-indigo-600 font-semibold">{s.role}</div>
                  <Badge variant={s.relationship === 'Champion' ? 'success' : s.relationship === 'Decision Maker' ? 'purple' : 'default'} className="mt-1">
                    {s.relationship}
                  </Badge>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 leading-relaxed">
                <strong className="text-slate-800">Key Context: </strong>
                {s.notes}
              </div>

              <div className="text-[11px] text-slate-400">
                Last interaction: {s.lastInteraction}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Memory */}
      {activeTab === 'memory' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Deal Memory</h3>
              <p className="text-xs text-slate-500">Experiences remembered from previous interactions with {deal.account}.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {memories.map((m) => (
                <div
                  key={m.id}
                  className={`p-5 rounded-xl border space-y-2.5 ${
                    m.type === 'worked'
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : m.type === 'failed'
                      ? 'bg-rose-50/50 border-rose-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        m.type === 'worked'
                          ? 'bg-emerald-100 text-emerald-800'
                          : m.type === 'failed'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      {m.type === 'worked' ? 'Successful Approach' : m.type === 'failed' ? 'Failed Approach' : 'Stakeholder Preference'}
                    </span>
                    <span className="text-[11px] text-slate-500">{m.date}</span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900">{m.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{m.description}</p>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Outcome: <strong className="text-slate-800">{m.outcome}</strong></span>
                    <span className="font-semibold text-indigo-600">{m.source}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Interactions */}
      {activeTab === 'interactions' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Interactions History</h3>
              <p className="text-xs text-slate-500">Full chronology of customer interactions and tactical results.</p>
            </div>
            <button
              onClick={() => setAddInteractionOpen(true)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Interaction</span>
            </button>
          </div>

          <div className="space-y-4">
            {interactions.map((int) => (
              <div
                key={int.id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{int.title}</span>
                    <Badge variant="default">{int.type}</Badge>
                  </div>
                  <span className="text-xs font-medium text-slate-500">{int.date}</span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{int.description}</p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200/80 text-xs">
                  {int.concern && (
                    <div>
                      <span className="text-slate-400 text-[11px] block">Concern:</span>
                      <span className="font-medium text-rose-700">{int.concern}</span>
                    </div>
                  )}
                  {int.approach && (
                    <div>
                      <span className="text-slate-400 text-[11px] block">Approach:</span>
                      <span className="font-medium text-slate-800">{int.approach}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-400 text-[11px] block">Outcome:</span>
                    <span
                      className={`font-bold ${
                        int.outcome === 'Positive'
                          ? 'text-emerald-600'
                          : int.outcome === 'Needs follow-up'
                          ? 'text-amber-600'
                          : 'text-rose-600'
                      }`}
                    >
                      {int.outcome}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Timeline (Matching Reference Screen 6) */}
      {activeTab === 'timeline' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-6">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Deal Memory Timeline</h3>
            <p className="text-xs text-slate-500">
              A chronological view of key interactions and what we learned.
            </p>
          </div>

          <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {/* Timeline item 1 */}
            <div className="relative space-y-1.5">
              <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-rose-500 ring-4 ring-white" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Pricing objection raised</span>
                <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                  Stored in Hindsight
                </span>
              </div>
              <div className="text-xs text-slate-500">Customer: Sarah Chen (CFO) · Sep 27, 2026</div>
              <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                Tactic: Discount pricing · Outcome: <strong className="text-rose-600">Failed</strong>
              </div>
            </div>

            {/* Timeline item 2 */}
            <div className="relative space-y-1.5">
              <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-amber-500 ring-4 ring-white" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Discount offered</span>
                <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                  Stored in Hindsight
                </span>
              </div>
              <div className="text-xs text-slate-500">Customer: Sarah Chen (CFO) · Sep 25, 2026</div>
              <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                Tactic: 10% concession · Outcome: <strong className="text-amber-600">Stalled progress</strong>
              </div>
            </div>

            {/* Timeline item 3 */}
            <div className="relative space-y-1.5">
              <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-4 ring-white" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">ROI analysis presented</span>
                <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                  Stored in Hindsight
                </span>
              </div>
              <div className="text-xs text-slate-500">Customer: Sarah Chen (CFO) · Sep 18, 2026</div>
              <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                Tactic: ROI/payback framing · Outcome: <strong className="text-emerald-600">Positive engagement</strong>
              </div>
            </div>

            {/* Timeline item 4 */}
            <div className="relative space-y-1.5">
              <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-blue-500 ring-4 ring-white" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Technical integration discussed</span>
                <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                  Stored in Hindsight
                </span>
              </div>
              <div className="text-xs text-slate-500">Customer: Michael Lee (VP Engineering) · Sep 12, 2026</div>
              <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                Tactic: Architecture review & API flow · Outcome: <strong className="text-emerald-600">Champion endorsement</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Briefing Modal */}
      <DealBriefingModal
        isOpen={briefingOpen}
        onClose={() => setBriefingOpen(false)}
        dealId={dealId || deal.id}
        dealName={deal.name}
        accountName={deal.account}
      />

      {/* Add Interaction Modal */}
      <AddInteractionModal
        isOpen={addInteractionOpen}
        onClose={() => setAddInteractionOpen(false)}
        initialDealId={deal.id}
      />
    </div>
  )
}

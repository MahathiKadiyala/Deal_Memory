import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  AlertTriangle,
  Brain,
  Calendar,
  Layers,
} from 'lucide-react'
import { KPICard } from '../components/common/KPICard'
import { Badge } from '../components/common/Badge'
import { DEMO_DEALS, DEMO_INTERACTIONS } from '../data/demoData'
import { DealBriefingModal } from '../components/deals/DealBriefingModal'
import { authStorage } from '../api/client'
import type { DealStage } from '../types'

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const currentUser = authStorage.getUser()
  const firstName = currentUser?.name ? currentUser.name.split(' ')[0] : 'there'
  const [briefingModalOpen, setBriefingModalOpen] = useState(false)
  const [selectedAccountForBriefing, setSelectedAccountForBriefing] = useState('Acme Corp')

  const stageVariant = (stage: DealStage) => {
    switch (stage) {
      case 'Negotiation':
        return 'warning'
      case 'Proposal':
        return 'info'
      case 'Discovery':
        return 'default'
      case 'Closed Won':
        return 'success'
      case 'Closed Lost':
        return 'danger'
      default:
        return 'default'
    }
  }

  const upcomingCalls = [
    {
      company: 'Acme Corp',
      time: 'Tomorrow, 11:00 AM',
      stakeholder: 'Sarah Chen (CFO)',
      deal: 'Enterprise Platform',
      dealId: 'acme',
    },
    {
      company: 'NovaTech',
      time: 'In 2 days, 2:00 PM',
      stakeholder: 'David Wilson (Sales Ops)',
      deal: 'Analytics Suite',
      dealId: 'novatech',
    },
    {
      company: 'CloudScale',
      time: 'In 3 days, 10:30 AM',
      stakeholder: 'Marcus Vance (CISO)',
      deal: 'Security Pro',
      dealId: 'cloudscale',
    },
  ]

  const handleOpenBriefing = (company: string) => {
    setSelectedAccountForBriefing(company)
    setBriefingModalOpen(true)
  }

  return (
    <div className="space-y-8">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Good morning, {firstName}!</span>
            <span className="text-2xl">👋</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Here's what your deal memory is telling you today.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleOpenBriefing('Acme Corp')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-md shadow-indigo-600/25 transition-all"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Prepare Me for Acme</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row (Matching Reference Image 2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Active Deals"
          value="24"
          change="+3"
          subtitle="since last week"
          icon={TrendingUp}
        />
        <KPICard
          title="Upcoming Calls"
          value="6"
          change="+2"
          subtitle="since last week"
          icon={Calendar}
        />
        <KPICard
          title="Pending Follow-ups"
          value="11"
          change="4"
          subtitle="due today"
          icon={Clock}
        />
        <KPICard
          title="Memories Stored"
          value="1,284"
          change="+235"
          subtitle="this month"
          icon={Brain}
          badgeText="Effective"
        />
      </div>

      {/* Main Grid: Your Deals (Left) + AI Insights & Upcoming Calls (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Your Deals Table (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">Your Deals</h2>
                <p className="text-xs text-slate-500">Prioritized by memory relevance and close velocity</p>
              </div>
              <Link
                to="/deals"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
              >
                <span>View all</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-5">Company / Deal</th>
                    <th className="py-3 px-3">Value</th>
                    <th className="py-3 px-3">Stage</th>
                    <th className="py-3 px-3">Last Interaction</th>
                    <th className="py-3 px-3">Main Objection</th>
                    <th className="py-3 px-3">Next Action</th>
                    <th className="py-3 px-4 text-center">Memory</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
                  {DEMO_DEALS.slice(0, 5).map((deal) => (
                    <tr
                      key={deal.id}
                      onClick={() => navigate(`/deals/${deal.id}`)}
                      className="hover:bg-slate-50/90 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-100 flex-shrink-0">
                            {deal.account.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {deal.account}
                            </div>
                            <div className="text-[11px] text-slate-400 font-normal">
                              {deal.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-bold text-slate-900">
                        ${deal.value.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-3">
                        <Badge variant={stageVariant(deal.stage)}>
                          {deal.stage}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-3 text-slate-500 text-[11px]">
                        {deal.lastInteraction}
                      </td>
                      <td className="py-3.5 px-3">
                        {deal.mainObjection ? (
                          <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                            {deal.mainObjection}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 font-medium">
                        {deal.nextActivity}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                          {deal.memoryScore}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Interactions Row */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Recent Interactions Logged</h3>
              </div>
              <Link to="/interactions" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                View stream →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {DEMO_INTERACTIONS.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/deals/${item.dealId}`)}
                  className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 transition-all cursor-pointer space-y-2"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-bold text-slate-700">{item.accountName}</span>
                    <span>{item.date.split('·')[0]}</span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {item.title}
                  </div>
                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span className="text-slate-500">{item.stakeholderName}</span>
                    <span
                      className={`font-semibold ${
                        item.outcome === 'Positive'
                          ? 'text-emerald-600'
                          : item.outcome === 'Needs follow-up'
                          ? 'text-amber-600'
                          : 'text-rose-600'
                      }`}
                    >
                      {item.outcome}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Memory Insights & Upcoming Calls (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* AI Memory Insights Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">AI Memory Insights</h3>
              </div>
              <Link to="/memory" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                View all →
              </Link>
            </div>

            {/* Alert Insight (Acme Corp Pricing) */}
            <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                  Acme Corp
                </span>
                <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">
                  Risk Alert
                </span>
              </div>
              <p className="text-xs text-rose-950 font-semibold leading-snug">
                Pricing objection appeared again in today's interaction.
              </p>
              <div className="text-[11px] text-slate-600 space-y-1 bg-white/80 p-2.5 rounded-lg border border-rose-200/60">
                <div>
                  <strong className="text-slate-800">Memory recall:</strong> Discount strategy previously failed.
                </div>
                <div>
                  <strong className="text-indigo-700">Recommended approach:</strong> Lead with ROI and payback analysis.
                </div>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                  Learned from previous outcome
                </span>
                <button
                  onClick={() => handleOpenBriefing('Acme Corp')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
                >
                  Prepare →
                </button>
              </div>
            </div>

            {/* Insight 2: Stakeholder Signal */}
            <div className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-indigo-950">
                <span>Stakeholder Signal</span>
                <span className="text-[10px] text-indigo-600 font-semibold">4 interactions</span>
              </div>
              <p className="text-xs text-slate-700">
                Technical stakeholders respond 3x better to integration architecture before commercials.
              </p>
            </div>
          </div>

          {/* Upcoming Calls Card (Matching Reference Screen 2) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Upcoming Calls</h3>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                3 This Week
              </span>
            </div>

            <div className="space-y-3">
              {upcomingCalls.map((call, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{call.company}</span>
                    <span className="text-[11px] font-medium text-slate-500">{call.time}</span>
                  </div>
                  <div className="text-[11px] text-slate-600">
                    {call.stakeholder} · {call.deal}
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => handleOpenBriefing(call.company)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                    >
                      <Sparkles className="h-3 w-3 text-indigo-500" />
                      <span>Prepare Me</span>
                    </button>
                    <Link
                      to={`/deals/${call.dealId}`}
                      className="text-xs font-medium text-slate-500 hover:text-slate-800"
                    >
                      Deal info →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Deal Briefing Modal */}
      <DealBriefingModal
        isOpen={briefingModalOpen}
        onClose={() => setBriefingModalOpen(false)}
        accountName={selectedAccountForBriefing}
      />
    </div>
  )
}

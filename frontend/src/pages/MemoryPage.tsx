import React, { useState, useMemo } from 'react'
import {
  Brain,
  Search,
  CheckCircle2,
  XCircle,
  Users,
  RotateCw,
  Sparkles,
} from 'lucide-react'
import { KPICard } from '../components/common/KPICard'
import { DEMO_MEMORIES } from '../data/demoData'
import type { MemoryType } from '../types'
import { Link } from 'react-router-dom'

export const MemoryPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('All')

  const filterOptions = [
    { id: 'All', label: 'All Memories' },
    { id: 'worked', label: 'Successful Approaches' },
    { id: 'failed', label: 'Failed Approaches' },
    { id: 'preference', label: 'Stakeholder Preferences' },
    { id: 'objection', label: 'Objections' },
    { id: 'competitor', label: 'Competitor Intel' },
  ]

  const filteredMemories = useMemo(() => {
    return DEMO_MEMORIES.filter((m) => {
      const matchesSearch =
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.accountName && m.accountName.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesFilter =
        filterType === 'All' || m.type === (filterType as MemoryType)

      return matchesSearch && matchesFilter
    })
  }, [searchQuery, filterType])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Memory</h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Brain className="h-3 w-3 text-indigo-600" />
              <span>Hindsight Core</span>
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            DealMemory learns from what happened across your sales conversations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/deals/acme"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Acme Deal Memory</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Row (Matching Section 12) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Memory Insights"
          value="1,284"
          change="+14"
          subtitle="this week"
          icon={Brain}
          badgeText="Active"
        />
        <KPICard
          title="Successful Approaches"
          value="47"
          change="+6"
          subtitle="validated wins"
          icon={CheckCircle2}
        />
        <KPICard
          title="Failed Approaches"
          value="23"
          change="Avoided"
          subtitle="mistakes prevented"
          icon={XCircle}
        />
        <KPICard
          title="Stakeholder Preferences"
          value="86"
          change="Synced"
          subtitle="across 34 accounts"
          icon={Users}
        />
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search what you've learned across deals..."
              className="w-full bg-slate-50 focus:bg-white text-xs text-slate-800 placeholder-slate-400 rounded-xl pl-9 pr-3.5 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {filterOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setFilterType(opt.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  filterType === opt.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Memories Cards (Left 8 cols) + Live Memory Stream (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Memories Cards */}
        <div className="lg:col-span-8 space-y-4">
          {filteredMemories.map((m) => {
            const isWorked = m.type === 'worked'
            const isFailed = m.type === 'failed'
            const isPref = m.type === 'preference'

            return (
              <div
                key={m.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:border-indigo-200 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        isWorked
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isFailed
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : isPref
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {isWorked
                        ? 'Successful Approach'
                        : isFailed
                        ? 'Failed Approach'
                        : isPref
                        ? 'Stakeholder Preference'
                        : m.type.toUpperCase()}
                    </span>

                    {m.accountName && (
                      <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                        {m.accountName}
                      </span>
                    )}
                  </div>

                  <span className="text-xs text-slate-400 font-medium">{m.date}</span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">{m.title}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{m.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-3 text-slate-500">
                    <span>
                      Outcome: <strong className="text-slate-800">{m.outcome}</strong>
                    </span>
                    <span>
                      Confidence: <strong className="text-emerald-600">{m.confidence}</strong>
                    </span>
                  </div>

                  <span className="text-[11px] font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                    Evidence: {m.source}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Right Column: Live Memory Activity Timeline (Matching Section 12) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <RotateCw className="h-4 w-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Recent Memory Activity</h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Live Sync
              </span>
            </div>

            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-rose-700">Memory Retained</span>
                  <span className="text-slate-400">Today · 2h ago</span>
                </div>
                <div className="text-xs font-semibold text-slate-800">
                  Pricing objection from Acme Corp
                </div>
                <p className="text-[11px] text-slate-500">
                  Discount proposal failed to move deal forward. Flagged as recurring pattern.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-emerald-700">Memory Retained</span>
                  <span className="text-slate-400">Sep 25</span>
                </div>
                <div className="text-xs font-semibold text-slate-800">
                  ROI discussion outcome
                </div>
                <p className="text-[11px] text-slate-500">
                  3-year payback model confirmed as winning tactic for CFO evaluations.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-indigo-700">Memory Recalled</span>
                  <span className="text-slate-400">Sep 24</span>
                </div>
                <div className="text-xs font-semibold text-slate-800">
                  Preparing for Acme pricing call
                </div>
                <p className="text-[11px] text-slate-500">
                  Recalled 18 historical touchpoints to produce deal briefing.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-amber-700">Memory Updated</span>
                  <span className="text-slate-400">Sep 22</span>
                </div>
                <div className="text-xs font-semibold text-slate-800">
                  Stakeholder preference detected
                </div>
                <p className="text-[11px] text-slate-500">
                  Engineering leaders require API security architecture review prior to commercials.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

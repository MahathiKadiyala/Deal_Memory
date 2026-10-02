import React, { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Plus,
  Search,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Clock,
  Sparkles,
  Users,
} from 'lucide-react'
import { Badge } from '../components/common/Badge'
import { DEMO_DEALS } from '../data/demoData'
import { DealBriefingModal } from '../components/deals/DealBriefingModal'
import type { DealStage, DealHealth } from '../types'

export const DealsPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialSearch = searchParams.get('search') || ''

  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [stageFilter, setStageFilter] = useState<string>('All')
  const [healthFilter, setHealthFilter] = useState<string>('All')
  const [briefingModalOpen, setBriefingModalOpen] = useState(false)
  const [selectedDealForBriefing, setSelectedDealForBriefing] = useState('Acme Corp')

  const stages = ['All', 'Negotiation', 'Proposal', 'Discovery', 'Closed Won', 'Closed Lost']
  const healthOptions = ['All', 'Healthy', 'At Risk', 'Stalled']

  const filteredDeals = useMemo(() => {
    return DEMO_DEALS.filter((deal) => {
      const matchesSearch =
        deal.account.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (deal.mainObjection && deal.mainObjection.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesStage =
        stageFilter === 'All' ||
        deal.stage.toLowerCase() === stageFilter.toLowerCase()

      const matchesHealth =
        healthFilter === 'All' ||
        deal.health.toLowerCase() === healthFilter.toLowerCase()

      return matchesSearch && matchesStage && matchesHealth
    })
  }, [searchQuery, stageFilter, healthFilter])

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

  const healthBadge = (health: DealHealth) => {
    switch (health) {
      case 'Healthy':
        return <Badge variant="success">Healthy</Badge>
      case 'At Risk':
        return <Badge variant="danger">At Risk</Badge>
      case 'Stalled':
        return <Badge variant="warning">Stalled</Badge>
      default:
        return null
    }
  }

  const handleOpenBriefing = (e: React.MouseEvent, accountName: string) => {
    e.stopPropagation()
    setSelectedDealForBriefing(accountName)
    setBriefingModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Deals</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Track and prepare for every opportunity with experiential deal memory.
          </p>
        </div>

        <button
          onClick={() => navigate('/deals/acme')}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Deal</span>
        </button>
      </div>

      {/* Quick Insights Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center gap-3">
          <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
          <span className="text-xs font-semibold text-amber-950">
            3 deals currently have active pricing objections.
          </span>
        </div>
        <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200/80 flex items-center gap-3">
          <Clock className="h-4 w-4 text-rose-600 flex-shrink-0" />
          <span className="text-xs font-semibold text-rose-950">
            2 deals have follow-ups due today.
          </span>
        </div>
        <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-center gap-3">
          <TrendingUp className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span className="text-xs font-semibold text-emerald-950">
            Acme Corp has the highest remembered interaction density (18).
          </span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search companies, objections, deals..."
              className="w-full bg-slate-50 focus:bg-white text-xs text-slate-800 placeholder-slate-400 rounded-xl pl-9 pr-3.5 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Health Pill Filter */}
          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs text-slate-400 font-semibold mr-1">Health:</span>
            {healthOptions.map((h) => (
              <button
                key={h}
                onClick={() => setHealthFilter(h)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  healthFilter === h
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {h}
              </button>
            ))}
          </div>
        </div>

        {/* Stage Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 pb-1">
          {stages.map((st) => (
            <button
              key={st}
              onClick={() => setStageFilter(st)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                stageFilter === st
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Deals Table (Matching Reference Screen 3) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-5">Company</th>
                <th className="py-3 px-3">Deal</th>
                <th className="py-3 px-3">Value</th>
                <th className="py-3 px-3">Stage</th>
                <th className="py-3 px-3">Health</th>
                <th className="py-3 px-3 text-center">Stakeholders</th>
                <th className="py-3 px-3">Last Interaction</th>
                <th className="py-3 px-3">Next Action</th>
                <th className="py-3 px-3 text-center">Memory</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
              {filteredDeals.length > 0 ? (
                filteredDeals.map((deal) => (
                  <tr
                    key={deal.id}
                    onClick={() => navigate(`/deals/${deal.id}`)}
                    className="hover:bg-slate-50/90 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-xs">
                          {deal.account.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {deal.account}
                          </div>
                          <div className="text-[11px] text-slate-400 font-normal">
                            Owner: {deal.owner}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-3 font-semibold text-slate-800">
                      {deal.name}
                    </td>
                    <td className="py-4 px-3 font-extrabold text-slate-900">
                      ${deal.value.toLocaleString()}
                    </td>
                    <td className="py-4 px-3">
                      <Badge variant={stageVariant(deal.stage)}>
                        {deal.stage}
                      </Badge>
                    </td>
                    <td className="py-4 px-3">
                      {healthBadge(deal.health)}
                    </td>
                    <td className="py-4 px-3 text-center">
                      <span className="inline-flex items-center gap-1 text-xs text-slate-600 font-semibold bg-slate-100 px-2 py-0.5 rounded-full">
                        <Users className="h-3 w-3 text-slate-400" />
                        {deal.stakeholdersCount}
                      </span>
                    </td>
                    <td className="py-4 px-3 text-slate-500 text-[11px]">
                      {deal.lastInteraction}
                    </td>
                    <td className="py-4 px-3 text-slate-700 font-medium">
                      <span className="text-slate-900 font-semibold">{deal.nextActivity}</span>
                      <div className="text-[11px] text-slate-400">{deal.nextActionDate}</div>
                    </td>
                    <td className="py-4 px-3 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                        {deal.memoryScore}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={(e) => handleOpenBriefing(e, deal.account)}
                          className="p-1.5 rounded-lg text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition-colors"
                          title="Prepare Me"
                        >
                          <Sparkles className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/deals/${deal.id}`)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    No deals match your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-800">{filteredDeals.length}</strong> of{' '}
            <strong className="text-slate-800">{DEMO_DEALS.length}</strong> deals
          </span>
          <span className="text-[11px] text-slate-400">
            Experiential memories auto-linked via conversation tracking
          </span>
        </div>
      </div>

      {/* Briefing Modal */}
      <DealBriefingModal
        isOpen={briefingModalOpen}
        onClose={() => setBriefingModalOpen(false)}
        accountName={selectedDealForBriefing}
      />
    </div>
  )
}

import React, { useState, useMemo } from 'react'
import {
  Plus,
  Search,
  Phone,
  Mail,
  Users,
  Presentation,
  CheckCircle2,
  AlertCircle,
  Brain,
} from 'lucide-react'
import { Badge } from '../components/common/Badge'
import { DEMO_INTERACTIONS, DEMO_DEALS } from '../data/demoData'
import { AddInteractionModal } from '../components/deals/AddInteractionModal'
import type { InteractionType } from '../types'
import { Link } from 'react-router-dom'

export const InteractionsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('All')
  const [selectedDeal, setSelectedDeal] = useState<string>('All')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const types: { id: string; label: string; icon?: React.ComponentType<{ className?: string }> }[] = [
    { id: 'All', label: 'All Interactions' },
    { id: 'Call', label: 'Calls', icon: Phone },
    { id: 'Meeting', label: 'Meetings', icon: Users },
    { id: 'Negotiation', label: 'Negotiations' },
    { id: 'Demo', label: 'Demos', icon: Presentation },
    { id: 'Email', label: 'Emails', icon: Mail },
  ]

  const filteredInteractions = useMemo(() => {
    return DEMO_INTERACTIONS.filter((i) => {
      const matchesSearch =
        i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.accountName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.stakeholderName.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesType =
        selectedType === 'All' || i.type === (selectedType as InteractionType)

      const matchesDeal =
        selectedDeal === 'All' || i.dealId === selectedDeal

      return matchesSearch && matchesType && matchesDeal
    })
  }, [searchQuery, selectedType, selectedDeal])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Interactions</h1>
          <p className="text-sm text-slate-500 mt-1">
            Every customer conversation is automatically analyzed and retained in deal memory.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>+ Add Interaction</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations, notes, people..."
              className="w-full bg-slate-50 focus:bg-white text-xs text-slate-800 placeholder-slate-400 rounded-xl pl-9 pr-3.5 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs text-slate-400 font-semibold">Deal:</span>
            <select
              value={selectedDeal}
              onChange={(e) => setSelectedDeal(e.target.value)}
              className="text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:bg-white"
            >
              <option value="All">All Deals</option>
              {DEMO_DEALS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.account}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Type Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 pb-1">
          {types.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedType(t.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedType === t.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interactions Stream List */}
      <div className="space-y-4">
        {filteredInteractions.map((int) => (
          <div
            key={int.id}
            className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4 hover:border-slate-300 transition-all"
          >
            {/* Header row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  {int.accountName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/deals/${int.dealId}`}
                      className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors"
                    >
                      {int.accountName}
                    </Link>
                    <span className="text-slate-400">·</span>
                    <span className="text-xs font-semibold text-slate-700">{int.dealName}</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    With <strong className="text-slate-800">{int.stakeholderName}</strong> ({int.stakeholderRole || 'Stakeholder'})
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="default">{int.type}</Badge>
                <span className="text-xs font-medium text-slate-400">{int.date}</span>
              </div>
            </div>

            {/* Interaction Title & Notes */}
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-slate-900">{int.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{int.description}</p>
            </div>

            {/* Deep Context Grid: Concern, Approach, Outcome */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-100 bg-slate-50/70 p-3 rounded-xl text-xs">
              <div>
                <span className="text-slate-400 text-[11px] block font-semibold">Key Concern Raised:</span>
                <span className="font-semibold text-rose-800 mt-0.5 block">
                  {int.concern || 'None reported'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 text-[11px] block font-semibold">Approach / Tactic Used:</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">
                  {int.approach || 'Standard discovery discussion'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 text-[11px] block font-semibold">Interaction Outcome:</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {int.outcome === 'Positive' ? (
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Positive
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-bold text-amber-600">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {int.outcome}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Hindsight Retained Badge */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <div className="inline-flex items-center gap-1.5 text-indigo-600 font-semibold">
                <Brain className="h-3.5 w-3.5" />
                <span>Retained in DealMemory experiential core</span>
              </div>
              <Link
                to={`/deals/${int.dealId}`}
                className="font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
              >
                View deal history →
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Add Interaction Modal */}
      <AddInteractionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  )
}

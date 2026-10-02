import React, { useState } from 'react'
import {
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import { DEMO_FOLLOWUPS } from '../data/demoData'
import { DealBriefingModal } from '../components/deals/DealBriefingModal'
import { Link } from 'react-router-dom'

export const FollowUpsPage: React.FC = () => {
  const [filter, setFilter] = useState<'All' | 'Today' | 'Upcoming' | 'Overdue' | 'Completed'>('All')
  const [followups, setFollowups] = useState(DEMO_FOLLOWUPS)
  const [briefingOpen, setBriefingOpen] = useState(false)
  const [briefingAccount, setBriefingAccount] = useState('Acme Corp')

  const toggleComplete = (id: string) => {
    setFollowups((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              status: f.status === 'completed' ? 'pending' : 'completed',
              category: f.status === 'pending' ? 'Completed' : 'Today',
            }
          : f
      )
    )
  }

  const filteredItems = followups.filter((item) => {
    if (filter === 'All') return true
    if (filter === 'Completed') return item.status === 'completed'
    return item.category === filter && item.status !== 'completed'
  })

  const openBriefing = (account: string) => {
    setBriefingAccount(account)
    setBriefingOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Follow-ups</h1>
          <p className="text-sm text-slate-500 mt-1">
            Stay ahead of every customer conversation with prioritized deal memory tasks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openBriefing('Acme Corp')}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition-all"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Prepare Today's Acme Call</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-2 overflow-x-auto">
        {(['All', 'Today', 'Upcoming', 'Overdue', 'Completed'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              filter === cat
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Follow-ups List */}
      <div className="space-y-4">
        {filteredItems.map((fu) => {
          const isCompleted = fu.status === 'completed'
          const isOverdue = fu.category === 'Overdue' && !isCompleted
          const isToday = fu.category === 'Today' && !isCompleted

          return (
            <div
              key={fu.id}
              className={`bg-white p-5 rounded-2xl border transition-all duration-150 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                isCompleted
                  ? 'border-slate-200 opacity-60 bg-slate-50/50'
                  : isOverdue
                  ? 'border-rose-200 shadow-sm bg-rose-50/20'
                  : isToday
                  ? 'border-indigo-200 shadow-sm'
                  : 'border-slate-200/90 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggleComplete(fu.id)}
                  className={`mt-1 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                    isCompleted
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-slate-300 hover:border-indigo-600 bg-white'
                  }`}
                  title={isCompleted ? 'Mark incomplete' : 'Mark complete'}
                >
                  {isCompleted && <CheckCircle2 className="h-4 w-4" />}
                </button>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-sm font-bold ${
                        isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                      }`}
                    >
                      {fu.action}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isOverdue
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : isToday
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {fu.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="font-semibold text-slate-800">{fu.accountName}</span>
                    <span>·</span>
                    <span>{fu.contactName}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1 font-mono text-[11px] text-slate-600">
                      <Clock className="h-3 w-3" />
                      {fu.time}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pl-9 md:pl-0 flex-shrink-0">
                <button
                  onClick={() => openBriefing(fu.accountName)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-all flex items-center gap-1"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Prepare Brief</span>
                </button>
                <Link
                  to={`/deals/${fu.dealId}`}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      {/* Briefing Modal */}
      <DealBriefingModal
        isOpen={briefingOpen}
        onClose={() => setBriefingOpen(false)}
        accountName={briefingAccount}
      />
    </div>
  )
}

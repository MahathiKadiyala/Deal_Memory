import React, { useState } from 'react'
import {
  Brain,
  CheckCircle2,
  Phone,
  Mail,
  Users,
  Presentation,
  Save,
} from 'lucide-react'
import { Modal } from '../common/Modal'
import { DEMO_DEALS, DEMO_STAKEHOLDERS } from '../../data/demoData'
import type { InteractionType, InteractionOutcome } from '../../types'

interface AddInteractionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave?: (interaction: any) => void
  initialDealId?: string
}

export const AddInteractionModal: React.FC<AddInteractionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialDealId = 'acme',
}) => {
  const [selectedDealId, setSelectedDealId] = useState(initialDealId)
  const [date, setDate] = useState('2026-09-27')
  const [stakeholder, setStakeholder] = useState('Sarah Chen (CFO)')
  const [type, setType] = useState<InteractionType>('Call')
  const [notes, setNotes] = useState('')
  const [keyObjection, setKeyObjection] = useState('Pricing')
  const [approach, setApproach] = useState('')
  const [outcome, setOutcome] = useState<InteractionOutcome>('Positive')
  const [followUp, setFollowUp] = useState('')
  const [isSavedNotice, setIsSavedNotice] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavedNotice(true)
    setTimeout(() => {
      if (onSave) {
        onSave({
          dealId: selectedDealId,
          date,
          stakeholder,
          type,
          notes,
          keyObjection,
          approach,
          outcome,
          followUp,
        })
      }
      setIsSavedNotice(false)
      onClose()
    }, 1000)
  }

  const types: { label: InteractionType; icon: React.ComponentType<{ className?: string }> }[] = [
    { label: 'Call', icon: Phone },
    { label: 'Email', icon: Mail },
    { label: 'Meeting', icon: Users },
    { label: 'Demo', icon: Presentation },
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="4xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Add Interaction</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Record the outcome of your latest customer interaction to feed DealMemory.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-200">
            <Brain className="h-3.5 w-3.5 text-indigo-600" />
            <span>Experiential Memory Loop</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Row 1: Company & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Company / Deal *
                </label>
                <select
                  value={selectedDealId}
                  onChange={(e) => setSelectedDealId(e.target.value)}
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  {DEMO_DEALS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.account} — {d.name} (${d.value.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Interaction Date *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Row 2: Stakeholder & Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Primary Stakeholder *
                </label>
                <select
                  value={stakeholder}
                  onChange={(e) => setStakeholder(e.target.value)}
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  {DEMO_STAKEHOLDERS.map((s) => (
                    <option key={s.id} value={`${s.name} (${s.role})`}>
                      {s.name} — {s.role} ({s.relationship})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Interaction Type *
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {types.map((t) => {
                    const Icon = t.icon
                    const isSelected = type === t.label
                    return (
                      <button
                        type="button"
                        key={t.label}
                        onClick={() => setType(t.label)}
                        className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg border text-[11px] font-semibold transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5 mb-0.5" />
                        <span>{t.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* What Happened (Textarea) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  What Happened? *
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {notes.length} / 2000
                </span>
              </div>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter call notes, key questions raised, stakeholder objections, or discussion takeaways..."
                className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-3 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed"
              />
            </div>

            {/* Key Objection & Approach / Tactic Used */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Key Objection Raised
                </label>
                <select
                  value={keyObjection}
                  onChange={(e) => setKeyObjection(e.target.value)}
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="None">None</option>
                  <option value="Pricing">Pricing & Budget</option>
                  <option value="Security">Security & SOC2</option>
                  <option value="Integration">CRM / API Integration</option>
                  <option value="Competition">Competitor (Salesforce / Gong)</option>
                  <option value="Timing">Implementation Timeline</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Approach / Tactic Used *
                </label>
                <input
                  type="text"
                  value={approach}
                  onChange={(e) => setApproach(e.target.value)}
                  placeholder="e.g. 3-year payback model / Discount offer"
                  className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Outcome Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Outcome *
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setOutcome('Positive')}
                  className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    outcome === 'Positive'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Positive</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOutcome('Neutral')}
                  className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    outcome === 'Neutral'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                      : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Neutral</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOutcome('Negative')}
                  className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    outcome === 'Negative'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                      : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>Negative</span>
                </button>
              </div>
            </div>

            {/* Next Action / Follow-up */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Next Follow-up Action
              </label>
              <input
                type="text"
                value={followUp}
                onChange={(e) => setFollowUp(e.target.value)}
                placeholder="e.g. Send updated ROI model before Thursday call"
                className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Right Column: Live Memory Feedback (1 col) */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-gradient-to-b from-indigo-50/70 via-white to-slate-50 border border-indigo-100/90 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                  <Brain className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Experiential Memory</h4>
                  <span className="text-[10px] text-indigo-600 font-semibold">Active Synthesis</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                DealMemory analyzes what worked and what failed in this interaction, updating your team's collective memory bank.
              </p>

              <div className="p-3 rounded-xl bg-white border border-slate-200/80 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-500">
                  <span>Strategy Retained:</span>
                  <span className="font-semibold text-slate-800">
                    {approach || 'Awaiting input...'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Outcome Flag:</span>
                  <span
                    className={`font-semibold ${
                      outcome === 'Positive'
                        ? 'text-emerald-600'
                        : outcome === 'Neutral'
                        ? 'text-amber-600'
                        : 'text-rose-600'
                    }`}
                  >
                    {outcome}
                  </span>
                </div>
              </div>

              {isSavedNotice ? (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <span>Memory updated! DealMemory retained this experience.</span>
                </div>
              ) : (
                <div className="text-[11px] text-slate-400 text-center">
                  Click save to index this interaction.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-600/25 transition-all flex items-center gap-1.5"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save Interaction</span>
          </button>
        </div>
      </form>
    </Modal>
  )
}

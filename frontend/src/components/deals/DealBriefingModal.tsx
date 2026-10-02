import React, { useEffect, useState } from 'react'
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCw,
  Bookmark,
  Brain,
  ArrowRight,
  Loader2,
  FileText,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react'
import { Modal } from '../common/Modal'
import { useNavigate } from 'react-router-dom'
import { dealsApi, authApi } from '../../api/client'
import type { RealDealBriefingResponse } from '../../types'

interface DealBriefingModalProps {
  isOpen: boolean
  onClose: () => void
  dealId?: string
  dealName?: string
  accountName?: string
}

export const DealBriefingModal: React.FC<DealBriefingModalProps> = ({
  isOpen,
  onClose,
  dealId = 'acme',
  accountName = 'Acme Corp',
}) => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [briefingData, setBriefingData] = useState<RealDealBriefingResponse | null>(null)

  const fetchBriefing = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await dealsApi.prepareDeal(dealId)
      setBriefingData(res)
    } catch (err: any) {
      setError(
        err.message ||
          'Failed to generate AI Deal Briefing. Please ensure backend services are connected.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchBriefing()
    }
  }, [isOpen, dealId])

  const briefing = briefingData?.briefing

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                <span>AI Deal Briefing</span>
              </div>

              {/* Hindsight Experiential Memory Status Indicator */}
              {briefingData && briefingData.hindsight_status === 'recalled' && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Brain className="h-3 w-3 text-emerald-600" />
                  <span>
                    {briefingData.recalled_memories_count} experiences recalled from DealMemory
                  </span>
                </div>
              )}

              {briefingData && briefingData.hindsight_status === 'failed' && (
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  <AlertCircle className="h-3 w-3 text-amber-600" />
                  <span>Hindsight sync unavailable</span>
                </div>
              )}
            </div>

            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Pre-Call Intelligence — {briefingData?.account_name || accountName}
            </h2>

            <p className="text-xs text-slate-500 mt-0.5">
              {briefingData ? (
                <>
                  Synthesized from{' '}
                  <strong className="text-slate-700">
                    {briefingData.hindsight_status === 'recalled'
                      ? `${briefingData.recalled_memories_count} Hindsight experiential memories`
                      : 'CRM interactions'}
                  </strong>{' '}
                  and current deal context using{' '}
                  <span className="font-semibold text-indigo-600">
                    {briefingData.model}
                  </span>
                  .
                </>
              ) : (
                'Connecting to DealMemory experiential memory & Groq LLM reasoning...'
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchBriefing}
              disabled={loading}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCw className={`h-3.5 w-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
            </button>
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <Bookmark className="h-3.5 w-3.5" />
              <span>Save Brief</span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-16 px-6 text-center space-y-4">
            <div className="relative inline-flex items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm animate-pulse">
                <Brain className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="absolute -top-1 -right-1">
                <Loader2 className="h-5 w-5 text-indigo-600 animate-spin" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Synthesizing AI Deal Intelligence
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Querying PostgreSQL deal interactions, recalling experiential memory patterns
                from Hindsight Cloud, and reasoning over strategic recommendations with Groq...
              </p>
            </div>
            <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 font-medium pt-2">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> CRM Context
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Hindsight Recall
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500" /> Groq Reasoning
              </span>
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="p-6 rounded-2xl bg-rose-50/70 border border-rose-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-rose-900">
                {error.toLowerCase().includes('not found')
                  ? 'Access Restricted by User Isolation'
                  : 'AI Briefing Generation Unavailable'}
              </h3>
              <p className="text-xs text-rose-700 max-w-md mx-auto leading-relaxed">
                {error.toLowerCase().includes('not found')
                  ? 'This Acme Corp deal belongs exclusively to the demo user (sarah.johnson@dealmemory.com). Strict server-side user isolation prevents accounts from accessing other users\' deals.'
                  : error}
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-2.5 flex-wrap">
              <button
                onClick={fetchBriefing}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-rose-600/20 cursor-pointer"
              >
                Try Again
              </button>
              {error.toLowerCase().includes('not found') && (
                <button
                  onClick={async () => {
                    setLoading(true)
                    try {
                      await authApi.login('sarah.johnson@dealmemory.com', 'password123')
                      fetchBriefing()
                    } catch (e: any) {
                      setError(e.message)
                    } finally {
                      setLoading(false)
                    }
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-indigo-600/20 cursor-pointer"
                >
                  Switch to Demo User (Sarah Johnson)
                </button>
              )}
            </div>
          </div>
        )}

        {/* Real Data Loaded */}
        {!loading && !error && briefing && (
          <>
            {/* 4-Box Grid: Key Points, What Worked, What Didn't Work, Stakeholder Context */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 1. What You Should Know / Key Points */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[11px] font-bold">
                    1
                  </span>
                  <span>What You Should Know</span>
                </div>
                <ul className="space-y-2">
                  {briefing.key_points && briefing.key_points.length > 0 ? (
                    briefing.key_points.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-xs text-slate-500 italic">
                      No specific key points recorded.
                    </li>
                  )}
                </ul>
              </div>

              {/* 2. What Worked Before */}
              <div className="p-4 rounded-xl border border-emerald-200/80 bg-emerald-50/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>What Worked Before</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                    Validated from Experience
                  </span>
                </div>
                <ul className="space-y-2">
                  {briefing.what_worked && briefing.what_worked.length > 0 ? (
                    briefing.what_worked.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-xs text-slate-500 italic">
                      Insufficient recorded evidence for successful tactics.
                    </li>
                  )}
                </ul>
              </div>

              {/* 3. What Didn't Work */}
              <div className="p-4 rounded-xl border border-rose-200/80 bg-rose-50/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-800 uppercase tracking-wider">
                    <XCircle className="h-4 w-4 text-rose-600" />
                    <span>What Didn't Work</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                    Risk Alert
                  </span>
                </div>
                <ul className="space-y-2">
                  {briefing.what_failed && briefing.what_failed.length > 0 ? (
                    briefing.what_failed.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-xs text-slate-500 italic">
                      Insufficient recorded evidence for failed tactics.
                    </li>
                  )}
                </ul>
              </div>

              {/* 4. Stakeholder Context */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[11px] font-bold">
                    4
                  </span>
                  <span>Stakeholder Context</span>
                </div>
                <div className="space-y-2">
                  {briefing.stakeholders && briefing.stakeholders.length > 0 ? (
                    briefing.stakeholders.map((stk, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-white border border-slate-200/80 flex items-start gap-2.5"
                      >
                        <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </div>
                        <div className="text-xs text-slate-700 leading-relaxed">
                          {stk}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic">
                      No specific stakeholder dynamics recorded.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 5. Pending Commitments */}
            {briefing.pending_commitments && briefing.pending_commitments.length > 0 && (
              <div className="p-4 rounded-xl border border-amber-200/80 bg-amber-50/40 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <span>5. Pending Commitments & Next Steps</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {briefing.pending_commitments.map((com, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-amber-200 text-xs text-slate-700 font-medium"
                    >
                      <div className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                      <span>{com}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strategic Recommendation Banner */}
            <div className="p-5 rounded-xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white shadow-lg shadow-indigo-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex-shrink-0">
                  <Brain className="h-6 w-6 text-indigo-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                      DealMemory Strategic Recommendation
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-400/20 text-indigo-200 border border-indigo-300/30 font-semibold">
                      Grounded in Experience
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 font-medium mt-1 leading-relaxed max-w-xl">
                    "{briefing.recommended_approach}"
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
                <button
                  onClick={() => {
                    onClose()
                    navigate('/memory')
                  }}
                  className="px-3 py-2 text-xs font-semibold text-indigo-200 hover:text-white bg-white/10 hover:bg-white/15 rounded-lg transition-colors cursor-pointer"
                >
                  View Memory
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Ready for Call</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* 6. Evidence & Citations from Memory */}
            {briefing.evidence && briefing.evidence.length > 0 && (
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <ShieldCheck className="h-4 w-4 text-indigo-600" />
                  <span>6. Grounded Evidence & Memory Citations</span>
                </div>
                <div className="space-y-1.5 pt-1">
                  {briefing.evidence.map((ev, idx) => (
                    <div
                      key={idx}
                      className="text-xs text-slate-600 flex items-start gap-2 bg-white p-2 rounded-lg border border-slate-200/70"
                    >
                      <FileText className="h-3.5 w-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                      <span>{ev}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  )
}

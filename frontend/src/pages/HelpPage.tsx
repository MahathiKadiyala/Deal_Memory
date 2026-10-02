import React, { useState } from 'react'
import {
  Brain,
  Sparkles,
  HelpCircle,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
} from 'lucide-react'
import { Link } from 'react-router-dom'

export const HelpPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const faqs = [
    {
      q: 'How does DealMemory differ from meeting transcription tools?',
      a: 'Transcription tools record audio and generate surface-level meeting notes. DealMemory analyzes the strategic outcomes of those meetings: what pricing arguments convinced the buyer, which technical concerns stalled the deal, and how different stakeholders make decisions.',
    },
    {
      q: 'What is the "Prepare Me" button and how should I use it?',
      a: 'Clicking "Prepare Me" synthesizes an instant pre-call briefing before any customer meeting. It highlights previous commitments, proven tactics for this specific stakeholder, and mistakes to avoid based on past interactions.',
    },
    {
      q: 'How do "What Worked" and "What Failed" insights get generated?',
      a: 'Whenever an interaction is recorded with an approach and an outcome (Positive, Neutral, or Negative), DealMemory indexes the causal relationship. When similar objections or stages recur, the system surfaces validated winning tactics.',
    },
    {
      q: 'Can memories be shared across team members?',
      a: 'Yes. Institutional deal memory prevents new sales representatives from repeating mistakes previously made on an account, drastically accelerating new rep ramp time.',
    },
  ]

  const workflowSteps = [
    { num: '01', title: 'Capture Interaction', desc: 'Call notes, emails, and meetings are logged with buyer responses.' },
    { num: '02', title: 'Experiential Retain', desc: 'DealMemory extracts what strategy worked or failed into durable memory.' },
    { num: '03', title: 'Vectorized Memory', desc: 'Cross-deal learnings accumulate over time across accounts.' },
    { num: '04', title: 'Contextual Recall', desc: 'Relevant memories are surfaced right before customer touchpoints.' },
    { num: '05', title: 'AI Deal Brief', desc: 'Tailored recommendations prepare you for every objection.' },
    { num: '06', title: 'Better Conversation', desc: 'Conversations start with experience instead of generic guesswork.' },
    { num: '07', title: 'Continuous Learning', desc: 'The outcome creates a new memory, making the engine smarter.' },
  ]

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Help & Knowledge Base</h1>
        <p className="text-sm text-slate-500 mt-1">
          Learn how to master experiential deal memory and close complex B2B deals faster.
        </p>
      </div>

      {/* Visual DealMemory Loop Card (Matching Reference Screen 9) */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-1">
              <Brain className="h-3.5 w-3.5 text-indigo-600" />
              <span>Core Architecture</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">How DealMemory Learns</h2>
            <p className="text-xs text-slate-500">From every interaction to continuous recommendations.</p>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            Remember → Learn → Adapt
          </span>
        </div>

        {/* Process Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {workflowSteps.map((step) => (
            <div
              key={step.num}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center space-y-1.5 hover:border-indigo-300 transition-all"
            >
              <span className="text-[11px] font-extrabold text-indigo-600 font-mono block">
                {step.num}
              </span>
              <div className="text-xs font-bold text-slate-900 leading-tight">
                {step.title}
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-600 flex-shrink-0" />
            <span>
              The more customer interactions you log in DealMemory, the sharper your team's collective sales intelligence becomes.
            </span>
          </div>
          <Link
            to="/dashboard"
            className="font-bold text-indigo-700 hover:text-indigo-900 whitespace-nowrap ml-3"
          >
            Go to Dashboard →
          </Link>
        </div>
      </div>

      {/* Guide Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <BookOpen className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Getting Started</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Begin by importing your current active pipeline from CRM or adding opportunities directly with target stakeholders and key objections.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Sparkles className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Preparing for a Deal</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Click "Prepare Me" before any major customer conversation to review verified winning tactics, stakeholder preferences, and open commitments.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Understanding Memory</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Distinguish between static conversation notes and experiential memory: DealMemory isolates cause, effect, and predictive buyer reactions.
          </p>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="pb-3 border-b border-slate-100 flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-indigo-600" />
          <h3 className="text-base font-bold text-slate-900">Frequently Asked Questions</h3>
        </div>

        <div className="divide-y divide-slate-100">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx
            return (
              <div key={idx} className="py-3.5">
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-left text-xs sm:text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  )}
                </button>
                {isOpen && (
                  <p className="text-xs text-slate-600 mt-2.5 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                    {faq.a}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Contact Support Card */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-base font-bold">Need Help With Your Deal Intelligence Strategy?</h4>
          <p className="text-xs text-slate-300 mt-1">
            Our team of enterprise revenue architects can help you tune your team's memory framework.
          </p>
        </div>
        <button className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white transition-all whitespace-nowrap self-start sm:self-auto shadow-md shadow-indigo-600/30">
          Contact Revenue Support
        </button>
      </div>
    </div>
  )
}

import React, { useState } from 'react'
import {
  User,
  Bell,
  Sparkles,
  Save,
  CheckCircle2,
} from 'lucide-react'
import { authStorage } from '../api/client'

export const SettingsPage: React.FC = () => {
  const currentUser = authStorage.getUser()
  const [name, setName] = useState(currentUser?.name || 'Sales Representative')
  const [email, setEmail] = useState(currentUser?.email || 'user@dealmemory.com')
  const [role, setRole] = useState('Enterprise Account Executive')
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [preCallBriefing, setPreCallBriefing] = useState(true)
  const [timezone, setTimezone] = useState('America/New_York (EST)')
  const [defaultView, setDefaultView] = useState('Prioritized Deals')
  const [briefingStyle, setBriefingStyle] = useState('Action-Oriented & Tactical')
  const [detailLevel, setDetailLevel] = useState('High (Full Context & Historical Objections)')
  const [saved, setSaved] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Settings</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your personal preferences, notifications, and AI briefing parameters.
          </p>
        </div>

        {saved && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold animate-fadeIn">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Preferences saved!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Profile */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <User className="h-4 w-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">User Profile</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Sales Role
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Preferences */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Bell className="h-4 w-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Workspace Preferences</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white"
              >
                <option value="America/New_York (EST)">America/New_York (EST)</option>
                <option value="America/Chicago (CST)">America/Chicago (CST)</option>
                <option value="America/Los_Angeles (PST)">America/Los_Angeles (PST)</option>
                <option value="Europe/London (GMT)">Europe/London (GMT)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Default Dashboard View
              </label>
              <select
                value={defaultView}
                onChange={(e) => setDefaultView(e.target.value)}
                className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white"
              >
                <option value="Prioritized Deals">Prioritized Deals</option>
                <option value="Memory Insights Stream">Memory Insights Stream</option>
                <option value="Upcoming Calls & Follow-ups">Upcoming Calls & Follow-ups</option>
              </select>
            </div>

            <div className="sm:col-span-2 space-y-2 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailNotifs}
                  onChange={(e) => setEmailNotifs(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs text-slate-700 font-medium">
                  Receive daily email digest of upcoming calls with pre-assembled Deal Briefings
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preCallBriefing}
                  onChange={(e) => setPreCallBriefing(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs text-slate-700 font-medium">
                  Automatically pop pre-call briefing 10 minutes before calendar appointments
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Section 3: AI Preferences */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sparkles className="h-4 w-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">AI Deal Briefing Parameters</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Briefing Tone & Style
              </label>
              <select
                value={briefingStyle}
                onChange={(e) => setBriefingStyle(e.target.value)}
                className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white"
              >
                <option value="Action-Oriented & Tactical">Action-Oriented & Tactical</option>
                <option value="Executive & High-Level">Executive & High-Level</option>
                <option value="Analytical & Evidence-Dense">Analytical & Evidence-Dense</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Detail Level
              </label>
              <select
                value={detailLevel}
                onChange={(e) => setDetailLevel(e.target.value)}
                className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white"
              >
                <option value="High (Full Context & Historical Objections)">
                  High (Full Context & Historical Objections)
                </option>
                <option value="Balanced (Top 3 Dos and Don'ts)">
                  Balanced (Top 3 Dos and Don'ts)
                </option>
                <option value="Ultra-Fast (30-second bullet brief)">
                  Ultra-Fast (30-second bullet brief)
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition-all"
          >
            <Save className="h-4 w-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  )
}

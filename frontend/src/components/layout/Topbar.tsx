import React, { useState } from 'react'
import { Menu, Search, Bell, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { authStorage } from '../../api/client'

interface TopbarProps {
  onMenuClick: () => void
  onOpenAddInteraction?: () => void
}

export const Topbar: React.FC<TopbarProps> = ({ onMenuClick, onOpenAddInteraction }) => {
  const [searchValue, setSearchValue] = useState('')
  const navigate = useNavigate()
  const currentUser = authStorage.getUser()

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchValue.trim()) {
      navigate(`/deals?search=${encodeURIComponent(searchValue.trim())}`)
    }
  }

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left: Mobile hamburger & Global search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search deals, companies, or stakeholders..."
            className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 rounded-xl pl-10 pr-4 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-inner"
          />
        </form>
      </div>

      {/* Right: Actions, Notifications & Avatar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {onOpenAddInteraction && (
          <button
            onClick={onOpenAddInteraction}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-all"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            <span>+ Add Interaction</span>
          </button>
        )}

        <button
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>

        <div className="h-5 w-[1px] bg-slate-200 mx-1 hidden sm:block" />

        <div
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2 pl-1 cursor-pointer"
          title="Account settings"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 text-white flex items-center justify-center text-xs font-bold ring-2 ring-indigo-500/30">
            {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : 'DM'}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-bold text-slate-800 leading-tight">
              {currentUser?.name ? currentUser.name.split(' ')[0] : 'Sales Rep'}
            </div>
            <div className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">
              {currentUser?.email || 'Enterprise AE'}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Briefcase,
  Brain,
  MessageSquare,
  Building2,
  CalendarCheck,
  Settings,
  HelpCircle,
  X,
  LogOut,
} from 'lucide-react'
import { authStorage } from '../../api/client'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate()
  const currentUser = authStorage.getUser()
  const mainNav = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Deals', path: '/deals', icon: Briefcase },
    { name: 'Memory', path: '/memory', icon: Brain },
    { name: 'Interactions', path: '/interactions', icon: MessageSquare },
  ]

  const workspaceNav = [
    { name: 'Accounts', path: '/accounts', icon: Building2 },
    { name: 'Follow-ups', path: '/follow-ups', icon: CalendarCheck },
  ]

  const bottomNav = [
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'Help', path: '/help', icon: HelpCircle },
  ]

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
      isActive
        ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30'
        : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
    }`

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#0B132B] text-slate-200 border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800/60">
            <NavLink to="/dashboard" className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                  DealMemory
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">
                  AI Sales Agent
                </span>
              </div>
            </NavLink>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-170px)]">
            {/* Main Section */}
            <div>
              <div className="px-3 pb-2 text-[11px] font-bold tracking-wider uppercase text-slate-400">
                Main
              </div>
              <nav className="space-y-1">
                {mainNav.map((item) => {
                  const Icon = item.icon
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => onClose()}
                      className={navLinkClass}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span>{item.name}</span>
                    </NavLink>
                  )
                })}
              </nav>
            </div>

            {/* Workspace Section */}
            <div>
              <div className="px-3 pb-2 text-[11px] font-bold tracking-wider uppercase text-slate-400">
                Workspace
              </div>
              <nav className="space-y-1">
                {workspaceNav.map((item) => {
                  const Icon = item.icon
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => onClose()}
                      className={navLinkClass}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span>{item.name}</span>
                    </NavLink>
                  )
                })}
              </nav>
            </div>

            {/* Bottom Nav */}
            <div>
              <div className="px-3 pb-2 text-[11px] font-bold tracking-wider uppercase text-slate-400">
                Preferences
              </div>
              <nav className="space-y-1">
                {bottomNav.map((item) => {
                  const Icon = item.icon
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => onClose()}
                      className={navLinkClass}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span>{item.name}</span>
                    </NavLink>
                  )
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-[#090F21]">
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-indigo-500/40 flex-shrink-0">
                {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : 'DM'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white truncate">
                  {currentUser?.name || 'Sales Representative'}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {currentUser?.email || 'Active'}
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                authStorage.clearToken()
                navigate('/login')
              }}
              title="Sign out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors flex-shrink-0 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

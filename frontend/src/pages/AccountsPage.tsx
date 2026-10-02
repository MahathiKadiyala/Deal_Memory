import React, { useState } from 'react'
import { Plus, Search, Building2, ArrowRight } from 'lucide-react'
import { Badge } from '../components/common/Badge'
import { DEMO_ACCOUNTS } from '../data/demoData'
import { Link } from 'react-router-dom'
import type { DealHealth } from '../types'

export const AccountsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredAccounts = DEMO_ACCOUNTS.filter(
    (acc) =>
      acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.primaryContact.toLowerCase().includes(searchQuery.toLowerCase())
  )

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Accounts</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your customer accounts and cumulative relationship intelligence.
          </p>
        </div>

        <button className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto">
          <Plus className="h-4 w-4" />
          <span>+ New Account</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search accounts by name, industry, or contact..."
            className="w-full bg-slate-50 focus:bg-white text-xs text-slate-800 placeholder-slate-400 rounded-xl pl-9 pr-3.5 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium hidden sm:block">
          Total Managed Value:{' '}
          <strong className="text-slate-900">
            ${DEMO_ACCOUNTS.reduce((sum, a) => sum + a.totalValue, 0).toLocaleString()}
          </strong>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-5">Account</th>
                <th className="py-3.5 px-4">Industry</th>
                <th className="py-3.5 px-4 text-center">Open Deals</th>
                <th className="py-3.5 px-4">Total Value</th>
                <th className="py-3.5 px-4">Primary Contact</th>
                <th className="py-3.5 px-4">Last Activity</th>
                <th className="py-3.5 px-4">Health</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
              {filteredAccounts.map((acc) => (
                <tr key={acc.id} className="hover:bg-slate-50/90 transition-colors group">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-200 flex-shrink-0">
                        <Building2 className="h-4 w-4 text-slate-600" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {acc.name}
                        </div>
                        <div className="text-[11px] text-slate-400">Enterprise Account</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-slate-600">{acc.industry}</td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs">
                      {acc.openDeals}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-bold text-slate-900">
                    ${acc.totalValue.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 font-semibold text-slate-800">{acc.primaryContact}</td>
                  <td className="py-4 px-4 text-slate-500 text-[11px]">{acc.lastActivity}</td>
                  <td className="py-4 px-4">{healthBadge(acc.health)}</td>
                  <td className="py-4 px-4 text-right">
                    <Link
                      to="/deals/acme"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      <span>View deals</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

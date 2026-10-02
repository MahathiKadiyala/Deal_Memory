import type { LucideIcon } from 'lucide-react'

export interface KPICardProps {
  title: string
  value: string | number
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  subtitle?: string
  icon?: LucideIcon
  badgeText?: string
  variant?: 'default' | 'highlight'
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  subtitle,
  icon: Icon,
  badgeText,
  variant = 'default',
}) => {
  return (
    <div
      className={`rounded-2xl border p-5 transition-all duration-200 ${
        variant === 'highlight'
          ? 'bg-gradient-to-br from-indigo-900 to-slate-900 text-white border-indigo-800 shadow-md shadow-indigo-950/20'
          : 'bg-white border-slate-200/90 text-slate-900 shadow-sm hover:border-slate-300'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span
          className={`text-xs font-semibold tracking-wide uppercase ${
            variant === 'highlight' ? 'text-indigo-200' : 'text-slate-500'
          }`}
        >
          {title}
        </span>
        <div className="flex items-center gap-2">
          {badgeText && (
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                variant === 'highlight'
                  ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-400/30'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              {badgeText}
            </span>
          )}
          {Icon && (
            <div
              className={`p-2 rounded-xl ${
                variant === 'highlight'
                  ? 'bg-white/10 text-indigo-300'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              <Icon className="h-4 w-4" />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-extrabold tracking-tight">{value}</span>
      </div>

      {(change || subtitle) && (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs font-medium">
          {change && (
            <span
              className={
                variant === 'highlight'
                  ? 'text-emerald-300'
                  : 'text-emerald-600 flex items-center gap-0.5'
              }
            >
              {change}
            </span>
          )}
          {subtitle && (
            <span className={variant === 'highlight' ? 'text-slate-300' : 'text-slate-400'}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

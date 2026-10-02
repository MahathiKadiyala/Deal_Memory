import React from 'react'

export interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  hoverable?: boolean
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200/90 shadow-sm ${
        hoverable ? 'hover:shadow-md hover:border-slate-300 transition-all duration-150 cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}

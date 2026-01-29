import React from 'react'
import clsx from 'clsx'
import { cn } from '@/lib/utils'

type QuickCardProps = {
  color?: 'primary' | 'secondary'
  heading?: string
  value?: string | number
  subValue?: string
  children?: React.ReactNode
  className?: string
}

const accentMap = {
  primary: {
    solid: 'var(--color-accent-primary)',
    soft: 'white',
  },
  secondary: {
    solid: 'var(--color-accent-tertiary)',
    soft: 'white',
  },
}

const QuickCard: React.FC<QuickCardProps> = ({
  color = 'primary',
  heading = 'Housing',
  value = '$965.00',
  subValue = '43%',
  children,
  className,
}) => {
  const accent = accentMap[color]

  return (
    <div
      className={cn(
        'relative h-full overflow-hidden rounded-2xl p-4',
        'bg-bg-surface',
        'transition-transform duration-300 hover:-translate-y-0.5',
        className
      )}
    >
      {/* === BACKGROUND / SCI-FI ELEMENTS === */}

      {/* Soft Gradient Wash */}
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background: `${accent.solid}`,
        }}
      />

      {/* Floating Abstract Shapes (reference-inspired) */}
      <div
        className="pointer-events-none absolute -top-6 -right-6 h-24 w-24 rounded-2xl rotate-12 opacity-10"
        style={{ backgroundColor: accent.soft }}
      />
      <div
        className="pointer-events-none absolute top-2 left-4 h-10 w-10 rounded-xl rotate-12 opacity-10"
        style={{ backgroundColor: accent.soft }}
      />
      <div
        className="pointer-events-none absolute -bottom-6 left-8 h-10 w-10 rounded-xl rotate-12 opacity-10"
        style={{ backgroundColor: accent.soft }}
      />

      {/* Glow Edge */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          boxShadow: `inset 0 0 0 1px ${accent.soft}`,
        }}
      />

      {/* === CONTENT === */}
      <div className="relative z-10">
        {children ? (
          children
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-bg-main">
              {heading}
            </p>

            <p className="text-xl font-semibold tracking-tight text-bg-main">
              {value}
            </p>

            <span
              className="bg-white/30 backdrop-blur-2xl text-white inline-flex items-center rounded-full px-2 py-0.5 text-xs font-regular "
            >
              {subValue}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default QuickCard

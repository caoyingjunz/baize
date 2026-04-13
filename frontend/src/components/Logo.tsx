import { useId } from 'react'

interface LogoProps {
  /** 'dark' for dark backgrounds (white text), 'light' for light backgrounds (dark text) */
  variant?: 'dark' | 'light'
  /** 'sm' for compact navbars, 'md' (default) for sidebars and auth panels */
  size?: 'sm' | 'md'
  className?: string
}

export function Logo({ variant = 'light', size = 'md', className = '' }: LogoProps) {
  const uid = useId()
  const gradId = `bz-grad-${uid.replace(/:/g, '')}`

  const iconSize = size === 'sm' ? 26 : 32
  const textPrimary = variant === 'dark' ? 'text-white' : 'text-gray-900'
  const textSecondary = variant === 'dark' ? 'text-white/40' : 'text-gray-400'
  const titleSize = size === 'sm' ? 'text-[11px]' : 'text-[13px]'
  const subSize = size === 'sm' ? 'text-[7.5px]' : 'text-[8.5px]'

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* ── Logo mark: cute whale on violet→indigo gradient square ── */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop stopColor="#7c3aed" />
            <stop offset="1" stopColor="#4338ca" />
          </linearGradient>
        </defs>

        {/* Background */}
        <rect width="36" height="36" rx="9" fill={`url(#${gradId})`} />

        {/* Whale body — chubby rounded shape, head left, tail right */}
        <path
          fill="white"
          fillOpacity="0.93"
          d="M9 17 Q9 11 17 11 Q25 11 26 17 Q30 14 31 11 Q30 17 27 19 Q30 22 31 27 Q29 23 26 22 Q25 28 17 28 Q9 28 7 23 Q5 20 9 17 Z"
        />

        {/* Belly — lighter tint in lower front area */}
        <path
          fill="white"
          fillOpacity="0.32"
          d="M9 24 Q11 29 17 28 Q22 28 23 25 Q17 27 9 24 Z"
        />

        {/* Eye */}
        <circle cx="10.5" cy="19" r="2" fill="#5b21b6" />
        <circle cx="11.2" cy="18.3" r="0.75" fill="white" />

        {/* Water spout — two arching streams above the blowhole */}
        <path stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"
              d="M14.5 11 Q13.5 8 14.5 6" />
        <path stroke="white" strokeWidth="1.2" strokeLinecap="round" fill="none"
              d="M12 12 Q11 9.5 12 8" />
      </svg>

      {/* ── Wordmark ── */}
      <div className="flex flex-col leading-none">
        <span className={`font-bold tracking-[0.1em] ${titleSize} ${textPrimary}`}>
          BAIZE
        </span>
        <span className={`tracking-[0.22em] mt-0.5 font-medium ${subSize} ${textSecondary}`}>
          RESUME
        </span>
      </div>
    </div>
  )
}

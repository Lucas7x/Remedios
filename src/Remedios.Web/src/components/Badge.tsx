import { clsx } from 'clsx'

interface BadgeProps {
  variant: 'critico' | 'ok' | 'vencida' | 'aviso'
  children: React.ReactNode
}

export function Badge({ variant, children }: BadgeProps) {
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', {
      'bg-red-100 text-red-700': variant === 'critico' || variant === 'vencida',
      'bg-green-100 text-green-700': variant === 'ok',
      'bg-yellow-100 text-yellow-700': variant === 'aviso',
    })}>
      {children}
    </span>
  )
}

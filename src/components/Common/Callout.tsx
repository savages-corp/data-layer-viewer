import { Icon } from '@/components/Common/Icon'

export interface CalloutProps {
  readonly type: 'success' | 'error'
  readonly message: string
  readonly icon?: string
}

export function Callout({ type, message, icon }: CalloutProps) {
  const iconName = icon ?? (type === 'success' ? 'check' : 'exclamation')

  return (
    <div className={`callout callout-${type}`}>
      <Icon icon={iconName} size={16} className="callout-icon" />
      <span className="callout-message">{message}</span>
    </div>
  )
}

import { Icon } from '@/components/Common/Icon'

interface ServiceOptionProps {
  innerProps: any
  data: any
}

/**
 * Custom component to render the service option with an icon
 * Used in service selection dropdowns
 */
export function ServiceOption({ innerProps, data }: ServiceOptionProps) {
  return (
    <div
      {...innerProps}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '8px 12px',
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'background-color 0.2s ease',
        backgroundColor: innerProps.isFocused ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
      }}
      className="service-option"
    >
      <Icon icon={data.configuration.type} size={18} style={{ marginRight: '10px' }} />
      {data.label}
    </div>
  )
}

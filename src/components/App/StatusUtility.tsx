import { Status } from '@/types/status'

export interface StatusOption {
  value: Status
  label: string
}

/**
 * Function to get status color based on status value
 * @param status The status value
 * @returns Color code for the status
 */
export function getStatusColor(status: Status): string {
  if (status === Status.Unknown)
    return '#aaa' // Gray for unknown/inactive
  if (status.startsWith('SUCCESS'))
    return '#31c787' // Green for success states
  if (status.startsWith('ERROR'))
    return '#ff7090' // Red for error states
  return '#aaa' // Default gray
}

/**
 * Creates status options for dropdown menus
 * @param ti18n Translation function
 * @returns Array of status options
 */
export function createStatusOptions(ti18n: any): StatusOption[] {
  return [
    { value: Status.Success, label: ti18n.translate(ti18n.keys.statusSuccess) },
    { value: Status.SuccessNothingNew, label: ti18n.translate(ti18n.keys.statusSuccessNothingNew) },
    { value: Status.ErrorServicePull, label: ti18n.translate(ti18n.keys.statusErrorServicePull) },
    { value: Status.ErrorDataEgress, label: ti18n.translate(ti18n.keys.statusErrorDataEgress) },
    { value: Status.ErrorDataModelize, label: ti18n.translate(ti18n.keys.statusErrorDataModelize) },
    { value: Status.ErrorServicePush, label: ti18n.translate(ti18n.keys.statusErrorServicePush) },
    { value: Status.Unknown, label: ti18n.translate(ti18n.keys.statusInactive) },
  ]
}

/**
 * Custom component to render status options with colored status indicators
 */
export function StatusOptionComponent({ innerProps, data }: any) {
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
      <div
        style={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          backgroundColor: getStatusColor(data.value),
          marginRight: 10,
        }}
      />
      {data.label}
    </div>
  )
}

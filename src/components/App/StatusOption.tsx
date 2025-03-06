import type { TranslationKey } from '@/types/i18n'

import type { Ti18n } from '@zealsprince/ti18n'
import { Status } from '@/types/status'

export interface StatusOptionProps {
  value: Status
  label: string
}

/**
 * Function to get status color based on status value
 * @param status The status value
 * @returns Color code for the status
 */
export function getStatusColor(status: Status): string {
  switch (status) {
    case Status.Success:
    case Status.SuccessNothingNew:
    case Status.SuccessWithWarehouse:
      return '#4BBB60' // Green
    case Status.ErrorServicePull:
    case Status.ErrorDataEgress:
    case Status.ErrorDataModelize:
    case Status.ErrorServicePush:
      return '#FF6B6B' // Red
    case Status.ErrorInternalUnknown:
      return '#000' // Black
    case Status.Unset:
      return '#9E9E9E' // Grey
    default:
      return '#9E9E9E' // Grey
  }
}

/**
 * Creates status options for dropdown menus
 * @param ti18n Translation function
 * @returns Array of status options
 */
export function createStatusOptions(ti18n: Ti18n<TranslationKey>): StatusOptionProps[] {
  return [
    { value: Status.Success, label: ti18n.translate(ti18n.keys.statusSuccess) },
    { value: Status.SuccessWithWarehouse, label: ti18n.translate(ti18n.keys.statusSuccessWithWarehouse) },
    { value: Status.SuccessNothingNew, label: ti18n.translate(ti18n.keys.statusSuccessNothingNew) },
    { value: Status.ErrorServicePull, label: ti18n.translate(ti18n.keys.statusErrorServicePull) },
    { value: Status.ErrorDataEgress, label: ti18n.translate(ti18n.keys.statusErrorDataEgress) },
    { value: Status.ErrorDataModelize, label: ti18n.translate(ti18n.keys.statusErrorDataModelize) },
    { value: Status.ErrorServicePush, label: ti18n.translate(ti18n.keys.statusErrorServicePush) },
    { value: Status.ErrorInternalUnknown, label: ti18n.translate(ti18n.keys.statusErrorInternalUnknown) },
    { value: Status.Unset, label: ti18n.translate(ti18n.keys.statusInactive) },
  ]
}

/**
 * Custom component to render status options with colored status indicators
 */
export function StatusOption({ innerProps, data }: any) {
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

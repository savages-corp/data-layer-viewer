import type { ServiceConfiguration } from './service'
import type { Status } from './status'

export interface ServiceOption {
  label: string
  status?: Status
  configuration: ServiceConfiguration
}

export interface GroupedServiceOption {
  label: string
  options: ServiceOption[]
}

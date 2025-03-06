export interface AuditDBPush { //
  tenant_identifier: string
  source_type: string
  source_identifier: string
  destination_type: string
  destination_identifier: string
  latest_timestamp: string
  latest_status: string
}

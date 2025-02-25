export enum ServiceType {
  CommonAws = 'GENERIC-HYPERVISOR-AWS',
  CommonAzure = 'GENERIC-HYPERVISOR-AZURE',
  CommonGcp = 'GENERIC-HYPERVISOR-GCP',
  CommonHubspot = 'COMMON-HUBSPOT',
  CommonSalesforce = 'COMMON-SALESFORCE',
  CommonSlack = 'COMMON-SLACK',
  CommonZapier = 'COMMON-ZAPIER',

  GenericDatabase = 'GENERIC-DB-SQL',
  GenericHttp = 'GENERIC-HTTP',

  // These are viewer-only types to illustrate common infrastructure services.
  InfrastructureDb = 'INFRASTRUCTURE-DB',
  InfrastructureWarehouse = 'INFRASTRUCTURE-WAREHOUSE',
}

export interface ServiceConfiguration {
  type: ServiceType
  identifier: string
  parameters?: Record<string, string | number | boolean>
}

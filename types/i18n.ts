// To enable type checking for the keys, we need to cast the keys to a union of string literals matching the keys in the JSON files.
export type Key =
  | 'select-service-category-hypervisor'
  | 'service-generic-database'
  | 'service-common-hubspot'
  | 'service-common-salesforce'

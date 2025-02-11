export enum Status {
  Unknown = 'unknown',
  SuccessWithWarehouse = 'success_with_warehouse',
  SuccessNothingNew = 'success_nothing_new',
  Success = 'success',
  ErrorServicePull = 'error_service_pull',
  ErrorServicePush = 'error_service_push',
  ErrorDataModelize = 'error_data_modelize',
  ErrorDataEgress = 'error_data_egress',
  ErrorInternalUnknown = 'error_internal_unknown',
}

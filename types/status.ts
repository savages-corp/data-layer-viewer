export enum Status {
  Unknown = 'UNKNOWN',
  SuccessWithWarehouse = 'SUCCESS_WITH_WAREHOUSE',
  SuccessNothingNew = 'SUCCESS_NOTHING_NEW',
  Success = 'SUCCESS',
  ErrorServicePull = 'ERROR_SERVICE_PULL',
  ErrorServicePush = 'ERROR_SERVICE_PUSH',
  ErrorDataModelize = 'ERROR_DATA_MODELIZE',
  ErrorDataEgress = 'ERROR_DATA_EGRESS',
  ErrorInternalUnknown = 'ERROR_INTERNAL_UNKNOWN',
}

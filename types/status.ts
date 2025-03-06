export enum Status {
  Unset = 'UNSET',
  SuccessWithWarehouse = 'SUCCESS-WITH-WAREHOUSE',
  SuccessNothingNew = 'SUCCESS-NOTHING-NEW',
  Success = 'SUCCESS',
  ErrorServicePull = 'ERROR-SERVICE-PULL',
  ErrorServicePush = 'ERROR-SERVICE-PUSH',
  ErrorDataModelize = 'ERROR-DATA-MODELIZE',
  ErrorDataEgress = 'ERROR-DATA-EGRESS',
  ErrorInternalUnknown = 'ERROR-INTERNAL-UNKNOWN',
}

export enum Status {
  Unknown,
  SuccessWithWarehouse,
  SuccessNothingNew,
  Success,
  ErrorServicePull,
  ErrorServicePush,
  ErrorDataModelize,
  ErrorDataEgress,
  ErrorInternalUnknown,
}

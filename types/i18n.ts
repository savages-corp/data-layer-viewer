export const TRANSLATION_KEYS = [
  'generic-close',

  'stage-modelize',
  'stage-egress',

  'status-success',
  'status-success-nothing-new',
  'status-error-service-pull',
  'status-error-data-egress',
  'status-error-data-modelize',
  'status-error-service-push',
  'status-inactive',

  'select-service-category-hypervisor',
  'select-service-category-generic',
  'select-service-category-saas-crm',
  'select-service-category-saas-pm',
  'select-service-category-saas-dev',
  'select-service-category-saas-auth',
  'select-service-category-saas-payment',

  'service-generic-database',
  'service-common-hubspot',
  'service-common-salesforce',

  'modal-config-title',
  'modal-config-description',
  'modal-config-json',
  'modal-config-yaml',

  'select-layout-placeholder',
  'select-service-placeholder',

  'button-add-flow',
  'button-remove-flow',
  'button-config',

  'tutorial-layout',
  'tutorial-service',

  'annotation-source',
  'annotation-modelize',
  'annotation-destination',
  'annotation-flow-connect',

  'service-label-source',
  'service-label-destination',
  'service-label-pull',
  'service-label-push',
]

export type TranslationKey = typeof TRANSLATION_KEYS[number]

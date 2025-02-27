export enum ServiceType {
  // Cloud platforms
  GenericHypervisorAws = 'GENERIC-HYPERVISOR-AWS',
  GenericHypervisorAzure = 'GENERIC-HYPERVISOR-AZURE',
  GenericHypervisorGcp = 'GENERIC-HYPERVISOR-GCP',

  // SaaS - CRM & Marketing
  CommonHubspot = 'COMMON-HUBSPOT',
  CommonSalesforce = 'COMMON-SALESFORCE',
  CommonMailchimp = 'COMMON-MAILCHIMP',
  CommonIntercom = 'COMMON-INTERCOM',

  // SaaS - Project Management & Collaboration
  CommonAsana = 'COMMON-ASANA',
  CommonJira = 'COMMON-JIRA',
  CommonSlack = 'COMMON-SLACK',
  CommonZendesk = 'COMMON-ZENDESK',
  CommonTrello = 'COMMON-TRELLO',
  CommonClickup = 'COMMON-CLICKUP',
  CommonNotion = 'COMMON-NOTION',
  CommonMiro = 'COMMON-MIRO',

  // SaaS - Development & DevOps
  CommonGithub = 'COMMON-GITHUB',
  CommonGitlab = 'COMMON-GITLAB',
  CommonVercel = 'COMMON-VERCEL',
  CommonZapier = 'COMMON-ZAPIER',
  CommonCircleci = 'COMMON-CIRCLECI',
  CommonJenkins = 'COMMON-JENKINS',
  CommonDocker = 'COMMON-DOCKER',

  // SaaS - Identity & Auth
  CommonAuth0 = 'COMMON-AUTH0',
  CommonOkta = 'COMMON-OKTA',

  // SaaS - Payment & Finance
  CommonStripe = 'COMMON-STRIPE',
  CommonTwilio = 'COMMON-TWILIO',
  CommonPaypal = 'COMMON-PAYPAL',

  // Generic services
  GenericDatabase = 'GENERIC-DB-SQL',
  GenericNoSql = 'GENERIC-DB-NOSQL',
  GenericHttp = 'GENERIC-HTTP',
  GenericGraphQL = 'GENERIC-GRAPHQL',
  GenericQueue = 'GENERIC-QUEUE',
  GenericWarehouse = 'GENERIC-WAREHOUSE',
}

export interface ServiceConfiguration {
  type: ServiceType
  identifier: string
  parameters?: Record<string, string | number | boolean>
}
